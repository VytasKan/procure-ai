import { NextRequest, NextResponse } from 'next/server';
import { inventoryLedgerStore } from '@/backend/services/inventory-store';

export async function GET() {
  return NextResponse.json({
    items: inventoryLedgerStore.getItems(),
    lowStockCount: inventoryLedgerStore.getLowStockItems().length,
    policy: inventoryLedgerStore.getPolicy()
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, sku, quantity, percent, policy } = body;

    if (action === 'CONSUME') {
      const updated = inventoryLedgerStore.simulateConsumption(percent || 0.25);
      return NextResponse.json({
        success: true,
        items: updated,
        lowStockItems: inventoryLedgerStore.getLowStockItems()
      });
    }

    if (action === 'RESTOCK' && sku && quantity) {
      inventoryLedgerStore.restockItem(sku, quantity);
      return NextResponse.json({
        success: true,
        items: inventoryLedgerStore.getItems()
      });
    }

    if (action === 'UPDATE_POLICY' && policy) {
      inventoryLedgerStore.updatePolicy(policy);
      return NextResponse.json({
        success: true,
        policy: inventoryLedgerStore.getPolicy()
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

