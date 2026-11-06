import { NextRequest, NextResponse } from 'next/server';
import { ledgerStore } from '@/backend/services/ledger-store';
import { OrderStatus } from '@/backend/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const transactions = ledgerStore.getAll();

    const totalSpend = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
    const completedOrders = transactions.filter(tx => tx.status === 'COMPLETED' || tx.status === 'SHIPPED').length;
    const pendingOrders = transactions.filter(tx => tx.status === 'APPROVED' || tx.status === 'PENDING_APPROVAL').length;

    return NextResponse.json({
      transactions,
      metrics: {
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalOrders: transactions.length,
        completedOrders,
        pendingOrders,
        b2bSavingsEstimated: Math.round(totalSpend * 0.08 * 100) / 100
      }
    });
  } catch (error) {
    console.error('Ledger route error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve ledger data' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body as { id: string; status: OrderStatus };

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and Status are required' }, { status: 400 });
    }

    const updated = ledgerStore.updateStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error) {
    console.error('Ledger PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}
