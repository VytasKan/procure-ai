import { LedgerTransaction, OrderStatus, ProcurementQuote } from '../types';

class LedgerStore {
  private transactions: LedgerTransaction[] = [
    {
      id: 'tx-1001',
      orderNumber: 'PO-2026-0891',
      createdAt: '2026-11-04T14:32:00Z',
      updatedAt: '2026-11-04T16:10:00Z',
      title: 'Dev Team Mechanical Keyboards & Ergonomic Mice',
      department: 'Engineering',
      requestedBy: 'Alex Chen (VP Eng)',
      supplier: 'Logitech Business',
      itemCount: 4,
      totalAmount: 1079.96,
      currency: 'USD',
      status: 'SHIPPED',
      paypalOrderId: 'SANDBOX-ORD-9X281A',
      paypalPaymentUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=SANDBOX-ORD-9X281A',
      paypalStatus: 'COMPLETED',
      trackingNumber: '1Z9999999999999999',
      carrier: 'UPS Ground',
      items: [
        { name: 'Logitech MX Master 3S & Mechanical Keyboard Combo', quantity: 4, unitPrice: 269.99 }
      ]
    },
    {
      id: 'tx-1002',
      orderNumber: 'PO-2026-0892',
      createdAt: '2026-11-05T09:15:00Z',
      updatedAt: '2026-11-05T10:02:00Z',
      title: 'Executive Conference Room 4K Display',
      department: 'Operations',
      requestedBy: 'Sarah Jenkins (COO)',
      supplier: 'Dell Technologies',
      itemCount: 1,
      totalAmount: 489.99,
      currency: 'USD',
      status: 'COMPLETED',
      paypalOrderId: 'SANDBOX-ORD-4K910C',
      paypalPaymentUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=SANDBOX-ORD-4K910C',
      paypalStatus: 'CAPTURED',
      trackingNumber: '940011189956253762',
      carrier: 'FedEx Express',
      items: [
        { name: 'Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE)', quantity: 1, unitPrice: 489.99 }
      ]
    },
    {
      id: 'tx-1003',
      orderNumber: 'PO-2026-0893',
      createdAt: '2026-11-06T11:20:00Z',
      updatedAt: '2026-11-06T11:20:00Z',
      title: 'Sales Team Noise-Isolating Client Call Headsets',
      department: 'Sales',
      requestedBy: 'Marcus Vance',
      supplier: 'CDW Logistics',
      itemCount: 2,
      totalAmount: 438.00,
      currency: 'USD',
      status: 'APPROVED',
      paypalInvoiceId: 'SANDBOX-INV-88210',
      paypalPaymentUrl: 'https://www.sandbox.paypal.com/invoice/p/#SANDBOX-INV-88210',
      paypalStatus: 'SENT',
      items: [
        { name: 'Jabra Evolve2 65 Wireless Noise-Isolating Headset', quantity: 2, unitPrice: 219.00 }
      ]
    }
  ];

  getAll(): LedgerTransaction[] {
    return [...this.transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getById(id: string): LedgerTransaction | undefined {
    return this.transactions.find(tx => tx.id === id);
  }

  addFromQuote(
    quote: ProcurementQuote, 
    paypalResult: { id: string; url?: string; type: 'ORDER' | 'INVOICE' },
    department: string = 'General IT',
    requestedBy: string = 'ProcureAI Agent'
  ): LedgerTransaction {
    const newTx: LedgerTransaction = {
      id: `tx-${Date.now().toString().slice(-6)}`,
      orderNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: quote.title,
      department,
      requestedBy,
      supplier: quote.items[0]?.product.retailer || 'Multi-Vendor Supplier',
      itemCount: quote.items.reduce((sum, it) => sum + it.quantity, 0),
      totalAmount: quote.totalAmount,
      currency: quote.currency,
      status: 'COMPLETED',
      paypalOrderId: paypalResult.type === 'ORDER' ? paypalResult.id : undefined,
      paypalInvoiceId: paypalResult.type === 'INVOICE' ? paypalResult.id : undefined,
      paypalPaymentUrl: paypalResult.url,
      paypalStatus: 'CAPTURED',
      trackingNumber: `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      carrier: 'FedEx Priority',
      items: quote.items.map(it => ({
        name: it.product.title,
        quantity: it.quantity,
        unitPrice: it.unitPrice
      }))
    };

    this.transactions.unshift(newTx);
    return newTx;
  }

  updateStatus(id: string, status: OrderStatus): LedgerTransaction | undefined {
    const tx = this.transactions.find(t => t.id === id);
    if (tx) {
      tx.status = status;
      tx.updatedAt = new Date().toISOString();
    }
    return tx;
  }
}

// Global singleton for Next.js server instance across all routes
const globalStore = globalThis as unknown as { __procureLedgerStore?: LedgerStore };
if (!globalStore.__procureLedgerStore) {
  globalStore.__procureLedgerStore = new LedgerStore();
}
export const ledgerStore = globalStore.__procureLedgerStore;
