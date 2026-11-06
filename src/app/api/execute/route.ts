import { NextRequest, NextResponse } from 'next/server';
import { PayPalService } from '@/backend/services/paypal-client';
import { ledgerStore } from '@/backend/services/ledger-store';
import { ProcurementQuote } from '@/backend/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quote, department, requestedBy } = body as {
      quote: ProcurementQuote;
      department?: string;
      requestedBy?: string;
    };

    if (!quote || !quote.items || quote.items.length === 0) {
      return NextResponse.json({ error: 'Valid quote payload is required' }, { status: 400 });
    }

    let paypalResult: { id: string; url?: string; type: 'ORDER' | 'INVOICE' };

    if (quote.paymentMethod === 'PAYPAL_INVOICE') {
      const inv = await PayPalService.createInvoice(quote);
      paypalResult = {
        id: inv.id,
        url: inv.invoiceUrl,
        type: 'INVOICE'
      };
    } else {
      const ord = await PayPalService.createOrder(quote);
      paypalResult = {
        id: ord.id,
        url: ord.approveUrl,
        type: 'ORDER'
      };
    }

    // Save into the AG Grid ledger
    const newTx = ledgerStore.addFromQuote(
      quote,
      paypalResult,
      department || 'Engineering Ops',
      requestedBy || 'ProcureAI Agent'
    );

    return NextResponse.json({
      success: true,
      transaction: newTx,
      paypalResult
    });
  } catch (error) {
    console.error('Execution route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute PayPal transaction' },
      { status: 500 }
    );
  }
}

