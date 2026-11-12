import { NextRequest, NextResponse } from 'next/server';
import { ledgerStore } from '@/backend/services/ledger-store';
import { PayPalService } from '@/backend/services/paypal-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const transactions = ledgerStore.getAll();
    const agents = ledgerStore.getAgents();
    const timeframe = req.nextUrl.searchParams.get('timeframe') || '30d';

    // Timeframe filtering
    const now = Date.now();
    let cutoffMs = 30 * 24 * 60 * 60 * 1000;
    if (timeframe === '7d') cutoffMs = 7 * 24 * 60 * 60 * 1000;
    else if (timeframe === 'mtd') {
      const d = new Date();
      cutoffMs = now - new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    } else if (timeframe === 'all') {
      cutoffMs = Infinity;
    }

    const filteredTx = timeframe === 'all'
      ? transactions
      : transactions.filter(tx => (now - new Date(tx.createdAt).getTime()) <= cutoffMs);

    const directSettled = filteredTx
      .filter(tx => tx.status === 'DIRECT_SETTLED')
      .reduce((sum, tx) => sum + tx.totalAmount, 0);

    const escrowLocked = filteredTx
      .filter(tx => tx.status === 'ESCROW_LOCKED')
      .reduce((sum, tx) => sum + tx.totalAmount, 0);

    const verifiedCaptured = filteredTx
      .filter(tx => tx.status === 'VERIFIED_CAPTURED')
      .reduce((sum, tx) => sum + tx.totalAmount, 0);

    const disputedRefunded = filteredTx
      .filter(tx => tx.status === 'DISPUTED_REFUNDED')
      .reduce((sum, tx) => sum + (tx.refundAmount || tx.totalAmount), 0);

    const activeEscrowCount = filteredTx.filter(tx => tx.status === 'ESCROW_LOCKED').length;
    const completedCount = filteredTx.filter(tx => tx.status === 'DIRECT_SETTLED' || tx.status === 'VERIFIED_CAPTURED').length;
    const avgTrustScore = agents.length > 0
      ? Math.round(agents.reduce((sum, a) => sum + a.trustScore, 0) / agents.length)
      : 84;

    return NextResponse.json({
      transactions: filteredTx,
      agents,
      metrics: {
        totalSettled: Math.round((directSettled + verifiedCaptured) * 100) / 100,
        directSettled: Math.round(directSettled * 100) / 100,
        escrowLocked: Math.round(escrowLocked * 100) / 100,
        disputedRefunded: Math.round(disputedRefunded * 100) / 100,
        activeEscrowCount,
        completedCount,
        totalContracts: filteredTx.length,
        avgTrustScore,
        timeframe
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

async function handleAction(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || body.transactionId;
    const rawAction = body.action || '';
    const action = rawAction.toUpperCase();
    const reason = body.reason;
    const refundAmount = body.refundAmount;
    const autoSlaSlashing = body.autoSlaSlashing;

    if (!id || !action) {
      return NextResponse.json({ error: 'ID and Action are required' }, { status: 400 });
    }

    const tx = ledgerStore.getById(id);
    if (!tx) {
      return NextResponse.json({ error: 'Contract transaction not found' }, { status: 404 });
    }

    if (tx.status !== 'ESCROW_LOCKED') {
      return NextResponse.json(
        { error: `Transaction ${id} is in status ${tx.status} and cannot be transitioned.` },
        { status: 409 }
      );
    }

    if (action === 'VERIFY_AND_CAPTURE') {
      const authId = tx.paypalAuthId || tx.paypalOrderId || `AUTH-${tx.id.slice(-6)}`;
      const captureRes = await PayPalService.captureEscrowAuthorization(authId, tx.totalAmount, tx.currency);
      const updated = ledgerStore.verifyAndCaptureEscrow(id, captureRes.captureId);
      const agents = ledgerStore.getAgents();
      return NextResponse.json({ success: true, action, transaction: updated, agents, result: captureRes });
    } else if (action === 'DISPUTE_AND_REFUND') {
      const targetId = tx.paypalCaptureId || tx.paypalAuthId || tx.paypalOrderId || `ID-${tx.id.slice(-6)}`;
      const amountToRefund = refundAmount || tx.totalAmount;
      const refundRes = await PayPalService.refundOrVoidEscrow(targetId, amountToRefund, tx.currency, reason);
      const shouldSlash = autoSlaSlashing !== undefined ? Boolean(autoSlaSlashing) : true;
      const updated = ledgerStore.disputeAndRefundEscrow(id, refundRes.refundId, reason, amountToRefund, shouldSlash);
      const agents = ledgerStore.getAgents();
      return NextResponse.json({ success: true, action, transaction: updated, agents, result: refundRes });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Ledger action error:', error);
    return NextResponse.json({ error: 'Failed to update contract status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleAction(req);
}

export async function PATCH(req: NextRequest) {
  return handleAction(req);
}
