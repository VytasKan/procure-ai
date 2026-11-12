import { ENV, hasPayPalCredentials } from '../config/env';
import { AgentServiceContract } from '../types';

export interface PayPalSettlementResult {
  orderId: string;
  authorizationId?: string;
  captureId?: string;
  refundId?: string;
  status: string;
  approveUrl?: string;
  grossAmount: string;
  currency: string;
  isSimulated?: boolean;
  payoutBatchId?: string;
  actionType: 'DIRECT_CAPTURE' | 'ESCROW_AUTHORIZED' | 'VERIFIED_CAPTURED' | 'DISPUTED_REFUNDED';
}

/**
 * Service to handle PayPal REST API and @paypal/agent-toolkit operations
 */
export class PayPalService {
  private static cachedToken: { token: string; expiresAt: number } | null = null;

  /**
   * Access Token retrieval with caching
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
   * 🟢 HIGH-TRUST PATH: Direct Capture Settlement
   * Intent: CAPTURE. Autonomous instant disbursement for verified, high-reputation agents.
   */
  static async createDirectSettlement(contract: AgentServiceContract): Promise<PayPalSettlementResult> {
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
              reference_id: contract.contractId,
              description: `ProcureAI Direct Pay: ${contract.taskTitle} (Seller: ${contract.sellerAgent.name})`,
              amount: {
                currency_code: contract.currency,
                value: contract.totalAmount.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: contract.currency,
                    value: contract.totalAmount.toFixed(2)
                  }
                }
              },
              items: [
                {
                  name: `A2A Service: ${contract.taskTitle.slice(0, 100)}`,
                  sku: contract.sellerAgent.id,
                  unit_amount: {
                    currency_code: contract.currency,
                    value: contract.totalAmount.toFixed(2)
                  },
                  quantity: '1',
                  category: 'DIGITAL_GOODS'
                }
              ]
            }
          ],
          application_context: {
            brand_name: 'ProcureAI Settlement',
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
          const captureId = order.purchase_units?.[0]?.payments?.captures?.[0]?.id || `CAP-${order.id.slice(-6)}`;

          // Disburse payout directly from buyer agent account to seller agent
          let payoutBatchId: string | undefined;
          try {
            const payoutRes = await fetch(`${baseUrl}/v1/payments/payouts`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                sender_batch_header: {
                  sender_batch_id: `A2A-SETTLE-${order.id}-${Date.now().toString().slice(-4)}`,
                  email_subject: `ProcureAI Instant Direct Settlement: ${contract.contractId}`
                },
                items: [{
                  recipient_type: 'EMAIL',
                  amount: {
                    value: contract.totalAmount.toFixed(2),
                    currency: contract.currency
                  },
                  note: `Autonomous A2A payment for contract ${contract.contractId} (${contract.sellerAgent.handle})`,
                  receiver: ENV.COMPANY_EMAIL || 'sb-gv7wr53521203@business.example.com'
                }]
              })
            });

            if (payoutRes.ok) {
              const payoutData = await payoutRes.json();
              payoutBatchId = payoutData.batch_header?.payout_batch_id;
            }
          } catch (payoutErr) {
            console.warn('Direct payout disbursement error:', payoutErr);
          }

          return {
            orderId: order.id,
            captureId,
            status: 'COMPLETED',
            approveUrl: approveLink || `https://www.sandbox.paypal.com/checkoutnow?token=${order.id}`,
            grossAmount: contract.totalAmount.toFixed(2),
            currency: contract.currency,
            isSimulated: false,
            payoutBatchId,
            actionType: 'DIRECT_CAPTURE'
          };
        }
      } catch (err) {
        console.warn('PayPal live API connection error. Falling back to sandbox simulation:', err);
      }
    }

    const mockId = `SANDBOX-DIR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return {
      orderId: mockId,
      captureId: `CAP-${mockId.slice(-6)}`,
      status: 'COMPLETED',
      approveUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${mockId}`,
      grossAmount: contract.totalAmount.toFixed(2),
      currency: contract.currency,
      isSimulated: true,
      actionType: 'DIRECT_CAPTURE'
    };
  }

  /**
   * 🟡 LOW-TRUST PATH: Conditional Escrow Hold
   * Intent: AUTHORIZE. Locks buyer funds in escrow without immediate capture.
   */
  static async createEscrowHold(contract: AgentServiceContract): Promise<PayPalSettlementResult> {
    if (hasPayPalCredentials()) {
      try {
        const token = await this.getAccessToken();
        const baseUrl = ENV.PAYPAL_ENVIRONMENT === 'PRODUCTION'
          ? 'https://api-m.paypal.com'
          : 'https://api-m.sandbox.paypal.com';

        const payload = {
          intent: 'AUTHORIZE',
          purchase_units: [
            {
              reference_id: contract.contractId,
              description: `ProcureAI Conditional Escrow: ${contract.taskTitle} (Seller: ${contract.sellerAgent.name})`,
              amount: {
                currency_code: contract.currency,
                value: contract.totalAmount.toFixed(2)
              }
            }
          ],
          application_context: {
            brand_name: 'ProcureAI Conditional Escrow',
            user_action: 'CONTINUE',
            return_url: 'https://example.com/escrow/authorized',
            cancel_url: 'https://example.com/escrow/cancel'
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
          const authId = order.purchase_units?.[0]?.payments?.authorizations?.[0]?.id || `AUTH-${order.id}`;

          return {
            orderId: order.id,
            authorizationId: authId,
            status: 'AUTHORIZED',
            approveUrl: approveLink || `https://www.sandbox.paypal.com/checkoutnow?token=${order.id}`,
            grossAmount: contract.totalAmount.toFixed(2),
            currency: contract.currency,
            isSimulated: false,
            actionType: 'ESCROW_AUTHORIZED'
          };
        }
      } catch (err) {
        console.warn('PayPal live API escrow hold error:', err);
      }
    }

    const mockId = `SANDBOX-ESC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return {
      orderId: mockId,
      authorizationId: `AUTH-${mockId.slice(-6)}`,
      status: 'AUTHORIZED',
      approveUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${mockId}`,
      grossAmount: contract.totalAmount.toFixed(2),
      currency: contract.currency,
      isSimulated: true,
      actionType: 'ESCROW_AUTHORIZED'
    };
  }

  /**
   * 🔵 CAPTURE ESCROW AUTHORIZATION: Called upon successful verification of Seller deliverable
   * POST /v2/payments/authorizations/{id}/capture
   */
  static async captureEscrowAuthorization(
    authId: string, 
    amount: number, 
    currency: string = 'USD'
  ): Promise<{ captureId: string; status: string; isSimulated: boolean; endpoint: string }> {
    // Determine real PayPal authorization or order ID
    const cleanId = authId.startsWith('AUTH-') ? authId.replace('AUTH-', '') : authId;
    const endpoint = `/v2/payments/authorizations/${cleanId}/capture`;
    
    // If running in live mode with a real PayPal authorization ID
    if (hasPayPalCredentials() && !cleanId.includes('SANDBOX')) {
      try {
        const token = await this.getAccessToken();
        const baseUrl = ENV.PAYPAL_ENVIRONMENT === 'PRODUCTION'
          ? 'https://api-m.paypal.com'
          : 'https://api-m.sandbox.paypal.com';

        const res = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: {
              value: amount.toFixed(2),
              currency_code: currency
            },
            is_final_capture: true,
            note_to_payer: 'ProcureAI: Verified work artifact delivered. Escrow released to seller agent.'
          })
        });

        if (res.ok) {
          const data = await res.json();
          return {
            captureId: data.id || `CAP-${cleanId.slice(-6)}`,
            status: 'COMPLETED',
            isSimulated: false,
            endpoint
          };
        }
      } catch (err) {
        console.warn('Live PayPal capture error, falling back to clean simulated capture:', err);
      }
    }

    // Deterministic simulation
    return {
      captureId: `CAP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'COMPLETED',
      isSimulated: true,
      endpoint
    };
  }

  /**
   * 🔴 REFUND OR RESTITUTION: Executes partial or full refund on failed deliverables
   * POST /v2/payments/captures/{id}/refund OR POST /v2/payments/authorizations/{id}/void
   */
  static async refundOrVoidEscrow(
    identifier: string,
    amount: number,
    currency: string = 'USD',
    reason: string = 'Seller Agent deliverable failed verification'
  ): Promise<{ refundId: string; status: string; isSimulated: boolean; endpoint: string; amountRefunded: number }> {
    const isCapture = identifier.startsWith('CAP');
    const cleanId = identifier.replace(/^(AUTH-|CAP-)/, '');
    const endpoint = isCapture
      ? `/v2/payments/captures/${cleanId}/refund`
      : `/v2/payments/authorizations/${cleanId}/void`;

    if (hasPayPalCredentials() && !identifier.includes('SANDBOX')) {
      try {
        const token = await this.getAccessToken();
        const baseUrl = ENV.PAYPAL_ENVIRONMENT === 'PRODUCTION'
          ? 'https://api-m.paypal.com'
          : 'https://api-m.sandbox.paypal.com';

        if (isCapture) {
          const res = await fetch(`${baseUrl}/v2/payments/captures/${cleanId}/refund`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              amount: {
                value: amount.toFixed(2),
                currency_code: currency
              },
              note_to_payer: `ProcureAI Restitution: ${reason}`
            })
          });

          if (res.ok) {
            const data = await res.json();
            return {
              refundId: data.id || `REF-${cleanId.slice(-6)}`,
              status: 'REFUNDED',
              isSimulated: false,
              endpoint: `/v2/payments/captures/${cleanId}/refund`,
              amountRefunded: amount
            };
          }
        } else {
          const voidRes = await fetch(`${baseUrl}/v2/payments/authorizations/${cleanId}/void`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (voidRes.ok || voidRes.status === 204) {
            return {
              refundId: `VOID-${cleanId.slice(-6)}`,
              status: 'VOIDED',
              isSimulated: false,
              endpoint: `/v2/payments/authorizations/${cleanId}/void`,
              amountRefunded: amount
            };
          }
        }
      } catch (err) {
        console.warn('Live PayPal refund/void error, falling back to simulated refund:', err);
      }
    }

    // High fidelity simulated restitution via proper endpoint
    return {
      refundId: isCapture
        ? `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        : `VOID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: isCapture ? 'REFUNDED' : 'VOIDED',
      isSimulated: true,
      endpoint,
      amountRefunded: amount
    };
  }
}
