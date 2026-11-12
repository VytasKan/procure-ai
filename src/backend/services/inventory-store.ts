export interface InventoryItem {
  id: string;
  sku: string;
  title: string;
  category: 'Office Supplies' | 'IT Hardware' | 'Ergonomic Furniture' | 'Workstation Peripherals';
  currentStock: number;
  minThreshold: number;      // Reorder trigger point
  reorderQuantity: number;   // Auto-batch quantity
  unitPrice: number;
  unit: string;
  status: 'OPTIMAL' | 'REORDER_TRIGGERED' | 'CRITICAL_DEFICIT' | 'RESTOCKED_RECENTLY';
  procurementState: 'Active Recurring' | 'Pending Auto-PO' | 'Policy Review' | 'Fulfilled (History)';
  preferredSupplier: string; // e.g. 'staples.com', 'newegg.com', 'dell.com'
  isRiskyAlternativeAvailable?: boolean;
  riskyMerchantDomain?: string;
  riskyPrice?: number;
  imageUrl: string;
  lastAudited: string;
}

export interface ProcurementPolicy {
  maxUnitCostByCategory: Record<string, number>;
  disallowedBrands: string[];
  preferredSuppliersDiscountPercent: number; // e.g. 5% discount from Staples/Newegg
  riskyMerchantSurchargePercent: number;     // e.g. 15% surcharge for escrow + fraud vetting
}

export const DEFAULT_PROCUREMENT_POLICY: ProcurementPolicy = {
  maxUnitCostByCategory: {
    'Chairs': 200.00,        // Max $200 per chair
    'Desks': 450.00,         // Max $450 per standing desk
    'Monitors': 350.00,      // Max $350 per monitor
    'Supplies': 50.00,       // Max $50 per pack
    'Peripherals': 150.00    // Max $150
  },
  disallowedBrands: [
    'herman miller',
    'steelcase gesture',
    'apple pro display',
    'haworth fern'
  ],
  preferredSuppliersDiscountPercent: 5.0,  // 5% volume rebate from ProcureAI preferred suppliers
  riskyMerchantSurchargePercent: 12.0     // 12% surcharge on unvetted/risky merchants for escrow risk guarantee
};

export const INITIAL_INVENTORY_LEDGER: InventoryItem[] = [
  // Office Supplies
  {
    id: 'inv-bic-pens',
    sku: 'OFF-BIC-08',
    title: 'BIC Round Stic Grip Extra Life Ballpoint Pens (Box of 144)',
    category: 'Office Supplies',
    currentStock: 18,
    minThreshold: 25,
    reorderQuantity: 50,
    unitPrice: 38.50,
    unit: 'boxes',
    status: 'REORDER_TRIGGERED',
    procurementState: 'Pending Auto-PO',
    preferredSupplier: 'staples.com',
    isRiskyAlternativeAvailable: true,
    riskyMerchantDomain: 'borntostandout.com',
    riskyPrice: 18.00,
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&auto=format&fit=crop&q=80',
    lastAudited: 'Just now'
  },
  {
    id: 'inv-sgel-pens',
    sku: 'OFF-SGEL-07',
    title: 'Sharpie S-Gel Gel Pens Medium 0.7mm No-Smear Black (Pack of 36)',
    category: 'Office Supplies',
    currentStock: 6,
    minThreshold: 15,
    reorderQuantity: 30,
    unitPrice: 28.00,
    unit: 'packs',
    status: 'CRITICAL_DEFICIT',
    procurementState: 'Pending Auto-PO',
    preferredSupplier: 'newegg.com',
    imageUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=300&auto=format&fit=crop&q=80',
    lastAudited: 'Just now'
  },
  {
    id: 'inv-post-it',
    sku: 'OFF-POST-33',
    title: 'Post-it Super Sticky Notes 3x3 Canary Yellow (Pack of 24 Pads)',
    category: 'Office Supplies',
    currentStock: 35,
    minThreshold: 20,
    reorderQuantity: 25,
    unitPrice: 22.40,
    unit: 'packs',
    status: 'OPTIMAL',
    procurementState: 'Active Recurring',
    preferredSupplier: 'staples.com',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&auto=format&fit=crop&q=80',
    lastAudited: '2 hours ago'
  },
  {
    id: 'inv-copy-paper',
    sku: 'OFF-PPR-CASE',
    title: 'Hammermill Copy Plus 20lb Paper, 8.5x11, 10 Reams (5000 Sheets)',
    category: 'Office Supplies',
    currentStock: 48,
    minThreshold: 30,
    reorderQuantity: 40,
    unitPrice: 49.99,
    unit: 'cases',
    status: 'OPTIMAL',
    procurementState: 'Active Recurring',
    preferredSupplier: 'staples.com',
    imageUrl: 'https://images.unsplash.com/photo-1589330694653-dad6d3240a6e?w=300&auto=format&fit=crop&q=80',
    lastAudited: '4 hours ago'
  },

  // Ergonomic Furniture
  {
    id: 'inv-office-chair',
    sku: 'FURN-ALERA-MESH',
    title: 'Alera Elusion Series Mesh Mid-Back Swivel Chair (Black)',
    category: 'Ergonomic Furniture',
    currentStock: 2,
    minThreshold: 4,
    reorderQuantity: 4,
    unitPrice: 169.99,
    unit: 'units',
    status: 'REORDER_TRIGGERED',
    procurementState: 'Pending Auto-PO',
    preferredSupplier: 'staples.com',
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-731da89f3077?w=300&auto=format&fit=crop&q=80',
    lastAudited: 'Just now'
  },
  {
    id: 'inv-standing-desk',
    sku: 'FURN-DESK-W48',
    title: 'Dual-Motor Sit-to-Stand Workstation Desk 48x30 Walnut',
    category: 'Ergonomic Furniture',
    currentStock: 3,
    minThreshold: 3,
    reorderQuantity: 3,
    unitPrice: 389.00,
    unit: 'units',
    status: 'REORDER_TRIGGERED',
    procurementState: 'Pending Auto-PO',
    preferredSupplier: 'newegg.com',
    imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=300&auto=format&fit=crop&q=80',
    lastAudited: 'Just now'
  },
  {
    id: 'inv-anti-fatigue',
    sku: 'FURN-MAT-2436',
    title: 'Kangaroo Deluxe Commercial Anti-Fatigue Ergonomic Standing Mat',
    category: 'Ergonomic Furniture',
    currentStock: 14,
    minThreshold: 8,
    reorderQuantity: 10,
    unitPrice: 42.00,
    unit: 'units',
    status: 'OPTIMAL',
    procurementState: 'Active Recurring',
    preferredSupplier: 'staples.com',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&auto=format&fit=crop&q=80',
    lastAudited: '1 day ago'
  },

  // IT Hardware
  {
    id: 'inv-dell-4k',
    sku: 'IT-DELL-U27',
    title: 'Dell 27" 4K UHD UltraSharp USB-C Hub IPS Monitor (U2723QE)',
    category: 'IT Hardware',
    currentStock: 5,
    minThreshold: 5,
    reorderQuantity: 5,
    unitPrice: 349.00,
    unit: 'units',
    status: 'REORDER_TRIGGERED',
    procurementState: 'Pending Auto-PO',
    preferredSupplier: 'dell.com',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=80',
    lastAudited: 'Just now'
  },
  {
    id: 'inv-caldigit-tb4',
    sku: 'IT-DOCK-TS4',
    title: 'CalDigit TS4 Thunderbolt 4 18-Port Workstation Docking Station',
    category: 'IT Hardware',
    currentStock: 8,
    minThreshold: 4,
    reorderQuantity: 6,
    unitPrice: 399.00,
    unit: 'units',
    status: 'OPTIMAL',
    procurementState: 'Active Recurring',
    preferredSupplier: 'newegg.com',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
    lastAudited: 'Just now'
  },
  {
    id: 'inv-lenovo-t14',
    sku: 'IT-THINK-T14',
    title: 'Lenovo ThinkPad T14s Gen 4 Core i7 32GB RAM 1TB SSD',
    category: 'IT Hardware',
    currentStock: 4,
    minThreshold: 2,
    reorderQuantity: 3,
    unitPrice: 1290.00,
    unit: 'units',
    status: 'OPTIMAL',
    procurementState: 'Fulfilled (History)',
    preferredSupplier: 'newegg.com',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&auto=format&fit=crop&q=80',
    lastAudited: '3 days ago'
  },

  // Workstation Peripherals
  {
    id: 'inv-logi-mouse',
    sku: 'PERIPH-MX3S',
    title: 'Logitech MX Master 3S Ergonomic Bluetooth Precision Mouse',
    category: 'Workstation Peripherals',
    currentStock: 12,
    minThreshold: 10,
    reorderQuantity: 15,
    unitPrice: 99.00,
    unit: 'units',
    status: 'OPTIMAL',
    procurementState: 'Active Recurring',
    preferredSupplier: 'bestbuy.com',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=80',
    lastAudited: 'Just now'
  },
  {
    id: 'inv-logi-keys',
    sku: 'PERIPH-MX-KEYS',
    title: 'Logitech MX Mechanical Wireless Illuminated Keyboard (Tactile Quiet)',
    category: 'Workstation Peripherals',
    currentStock: 9,
    minThreshold: 8,
    reorderQuantity: 10,
    unitPrice: 149.99,
    unit: 'units',
    status: 'OPTIMAL',
    procurementState: 'Active Recurring',
    preferredSupplier: 'bestbuy.com',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80',
    lastAudited: '2 days ago'
  },
  {
    id: 'inv-sony-xm5',
    sku: 'PERIPH-SONY-XM5',
    title: 'Sony WH-1000XM5 Wireless Noise-Canceling ANC Headset',
    category: 'Workstation Peripherals',
    currentStock: 7,
    minThreshold: 6,
    reorderQuantity: 8,
    unitPrice: 389.00,
    unit: 'units',
    status: 'OPTIMAL',
    procurementState: 'Fulfilled (History)',
    preferredSupplier: 'newegg.com',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    lastAudited: '3 days ago'
  }
];

class InventoryLedgerService {
  private items: InventoryItem[] = [...INITIAL_INVENTORY_LEDGER];
  private policy: ProcurementPolicy = { ...DEFAULT_PROCUREMENT_POLICY };

  getItems(): InventoryItem[] {
    return this.items;
  }

  getPolicy(): ProcurementPolicy {
    return this.policy;
  }

  getLowStockItems(): InventoryItem[] {
    return this.items.filter(it => it.currentStock <= it.minThreshold);
  }

  simulateConsumption(percent: number = 0.25): InventoryItem[] {
    this.items = this.items.map(it => {
      const deduction = Math.max(1, Math.round(it.currentStock * percent));
      const newStock = Math.max(1, it.currentStock - deduction);
      let newStatus: InventoryItem['status'] = 'OPTIMAL';
      let newState: InventoryItem['procurementState'] = it.procurementState;

      if (newStock <= Math.round(it.minThreshold * 0.5)) {
        newStatus = 'CRITICAL_DEFICIT';
        newState = 'Pending Auto-PO';
      } else if (newStock <= it.minThreshold) {
        newStatus = 'REORDER_TRIGGERED';
        newState = 'Pending Auto-PO';
      }

      return {
        ...it,
        currentStock: newStock,
        status: newStatus,
        procurementState: newState,
        lastAudited: 'Just now (Consumption recorded)'
      };
    });
    return this.items;
  }

  restockItem(sku: string, qty: number) {
    const item = this.items.find(i => i.sku === sku);
    if (item) {
      item.currentStock += qty;
      item.status = 'OPTIMAL';
      item.procurementState = 'Active Recurring';
      item.lastAudited = 'Restocked via PayPal B2B Order';
    }
  }

  updateStock(sku: string, newStock: number) {
    const item = this.items.find(i => i.sku === sku);
    if (item) {
      item.currentStock = newStock;
      item.lastAudited = 'Manual inventory audit';
    }
  }

  updatePolicy(newPolicy: Partial<ProcurementPolicy>) {
    this.policy = { ...this.policy, ...newPolicy };
  }
}

export const inventoryLedgerStore = new InventoryLedgerService();
