import { NextRequest, NextResponse } from 'next/server';
import { PayPalService } from '@/backend/services/paypal-client';
import { ledgerStore } from '@/backend/services/ledger-store';
import { AgentServiceContract } from '@/backend/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contract } = body as {
      contract: AgentServiceContract;
    };

    if (!contract || !contract.contractId || !contract.sellerAgent) {
      return NextResponse.json({ error: 'Valid agent service contract payload is required' }, { status: 400 });
    }

    let settlement;
    if (contract.trustEvaluation?.route === 'CONDITIONAL_ESCROW' || contract.requiresEscrow) {
      settlement = await PayPalService.createEscrowHold(contract);
    } else {
      settlement = await PayPalService.createDirectSettlement(contract);
    }

    // Save into the AG Grid Trust & Escrow ledger
    const newTx = ledgerStore.addFromContract(contract, settlement);

    return NextResponse.json({
      success: true,
      transaction: newTx,
      settlement
    });
  } catch (error) {
    console.error('Execution route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute A2A transaction' },
      { status: 500 }
    );
  }
}
