import { ENV, hasPayPalCredentials } from '../config/env';
import { ProcurementQuote } from '../types';

export interface PayPalOrderResponse {
  id: string;
  status: string;
  approveUrl?: string;
  grossAmount: string;
  currency: string;
  isSimulated?: boolean;
}

export interface PayPalInvoiceResponse {
  id: string;
  status: string;
  invoiceNumber: string;
  invoiceUrl?: string;
  totalAmount: string;
  currency: string;
  isSimulated?: boolean;
}

export class PayPalService {
  private static cachedToken: { token: string; expiresAt: number } | null = null;

  /**
   * Fetch OAuth2 access token from PayPal Sandbox
   */
  static async getAccessToken(): Promise<string> {
    if (!hasPayPalCredentials()) {
      throw new Error('PayPal Client ID and Secret are not configured in environment.');
    }

    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now + 60000) {
      return this.cachedToken.token;
    }

    const auth = Buffer.from(`${ENV.PAYPAL_CLIENT_ID}:${ENV.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const baseUrl = ENV.PAYPAL_ENVIRONMENT === 'PRODUCTION' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`PayPal OAuth failed: ${response.status} ${errText}`);
    }

    const data = await response.json();
    this.cachedToken = {
      token: data.access_token,
      expiresAt: now + (data.expires_in * 1000)
    };

    return data.access_token;
  }

  /**
   * Create an Order in PayPal Sandbox
   */
  static async createOrder(quote: ProcurementQuote): Promise<PayPalOrderResponse> {
    if (hasPayPalCredentials()) {
      try {
        const token = await this.getAccessToken();
        const baseUrl = ENV.PAYPAL_ENVIRONMENT === 'PRODUCTION'
          ? 'https://api-m.paypal.com'
          : 'https://api-m.sandbox.paypal.com';

        const payload = {
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: quote.quoteId,
              description: `ProcureAI Order: ${quote.title}`,
              amount: {
                currency_code: quote.currency,
                value: quote.totalAmount.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: quote.currency,
                    value: quote.subtotal.toFixed(2)
                  },
                  shipping: {
                    currency_code: quote.currency,
                    value: quote.shippingCost.toFixed(2)
                  },
                  tax_total: {
                    currency_code: quote.currency,
                    value: quote.estimatedTax.toFixed(2)
                  },
                  discount: {
                    currency_code: quote.currency,
                    value: quote.bulkDiscount.toFixed(2)
                  }
                }
              },
              items: quote.items.map(item => ({
                name: item.product.title.slice(0, 120),
                sku: item.product.sku,
                unit_amount: {
                  currency_code: quote.currency,
                  value: item.unitPrice.toFixed(2)
                },
                quantity: item.quantity.toString(),
                category: 'PHYSICAL_GOODS'
              }))
            }
          ],
          application_context: {
            brand_name: 'ProcureAI Enterprise',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: 'https://example.com/checkout/success',
            cancel_url: 'https://example.com/checkout/cancel'
          }
        };

        const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const order = await res.json();
          const approveLink = order.links?.find((l: { rel: string; href: string }) => l.rel === 'approve')?.href;
          return {
            id: order.id,
            status: order.status || 'CREATED',
            approveUrl: approveLink || `https://www.sandbox.paypal.com/checkoutnow?token=${order.id}`,
            grossAmount: quote.totalAmount.toFixed(2),
            currency: quote.currency,
            isSimulated: false
          };
        } else {
          console.warn('Live PayPal Sandbox order call returned non-200. Falling back to sandbox simulation.');
        }
      } catch (err) {
        console.warn('PayPal live API connection error. Falling back to sandbox simulation:', err);
      }
    }

    // Realistic Sandbox Simulation
    const mockId = `SANDBOX-ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return {
      id: mockId,
      status: 'APPROVED',
      approveUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${mockId}`,
      grossAmount: quote.totalAmount.toFixed(2),
      currency: quote.currency,
      isSimulated: true
    };
  }

  /**
   * Create & Send an Invoicing draft via PayPal Invoicing API
   */
  static async createInvoice(quote: ProcurementQuote): Promise<PayPalInvoiceResponse> {
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    if (hasPayPalCredentials()) {
      try {
        const token = await this.getAccessToken();
        const baseUrl = ENV.PAYPAL_ENVIRONMENT === 'PRODUCTION'
          ? 'https://api-m.paypal.com'
          : 'https://api-m.sandbox.paypal.com';

        const payload = {
          detail: {
            invoice_number: invoiceNumber,
            reference: quote.quoteId,
            invoice_date: new Date().toISOString().split('T')[0],
            currency_code: quote.currency,
            note: quote.vendorNotes,
            term: 'NET_15'
          },
          invoicer: {
            name: {
              given_name: 'ProcureAI',
              surname: 'Corporate Solutions'
            },
            email_address: ENV.COMPANY_EMAIL
          },
          primary_recipients: [
            {
              billing_info: {
                name: {
                  given_name: 'Finance',
                  surname: 'Department'
                },
                email_address: 'accounts-payable@client.com'
              }
            }
          ],
          items: quote.items.map(item => ({
            name: item.product.title.slice(0, 100),
            quantity: item.quantity.toString(),
            unit_amount: {
              currency_code: quote.currency,
              value: item.unitPrice.toFixed(2)
            }
          }))
        };

        const res = await fetch(`${baseUrl}/v2/invoicing/invoices`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const inv = await res.json();
          return {
            id: inv.id || `INV-${Date.now()}`,
            status: 'SENT',
            invoiceNumber,
            invoiceUrl: `https://www.sandbox.paypal.com/invoice/p/#${inv.id}`,
            totalAmount: quote.totalAmount.toFixed(2),
            currency: quote.currency,
            isSimulated: false
          };
        }
      } catch (err) {
        console.warn('PayPal invoice call error, falling back to simulation:', err);
      }
    }

    const mockId = `SANDBOX-INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      id: mockId,
      status: 'SENT',
      invoiceNumber,
      invoiceUrl: `https://www.sandbox.paypal.com/invoice/p/#${mockId}`,
      totalAmount: quote.totalAmount.toFixed(2),
      currency: quote.currency,
      isSimulated: true
    };
  }
}
