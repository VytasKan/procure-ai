import { ProductItem } from '../types';

// Mock multi-retailer catalog mirroring Channel3 MCP dataset
const PRODUCT_CATALOG: ProductItem[] = [
  // Monitors & Displays
  {
    id: 'prod-mon-01',
    sku: 'DELL-U2723QE',
    title: 'Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE)',
    category: 'hardware',
    retailer: 'Dell Technologies',
    price: 489.99,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    rating: 4.8,
    specs: {
      resolution: '3840 x 2160 (4K)',
      panel: 'IPS Black',
      ports: 'USB-C 90W PD, HDMI, DisplayPort, RJ45 Ethernet',
      warranty: '3-Year Advanced Exchange'
    }
  },
  {
    id: 'prod-mon-02',
    sku: 'LG-27UK850',
    title: 'LG 27" UHD IPS HDR10 Monitor with AMD FreeSync',
    category: 'hardware',
    retailer: 'B&H Photo Video',
    price: 329.00,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 3,
    rating: 4.6,
    specs: {
      resolution: '4K UHD (3840 x 2160)',
      panel: 'IPS',
      ports: 'USB-C 60W, 2x HDMI, DisplayPort',
      warranty: '1-Year Limited'
    }
  },
  {
    id: 'prod-mon-03',
    sku: 'ASUS-PROART-27',
    title: 'ASUS ProArt PA278CV 27" 1440p Color-Accurate Display',
    category: 'hardware',
    retailer: 'Newegg Business',
    price: 299.00,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    rating: 4.7,
    specs: {
      resolution: '2560 x 1440 (2K QHD)',
      colorSpace: '100% sRGB / 100% Rec. 709',
      ports: 'USB-C 65W, HDMI, DP daisy chain',
      warranty: '3-Year Warranty'
    }
  },

  // Furniture / Ergonomics
  {
    id: 'prod-desk-01',
    sku: 'AUTO-SMARTDESK-CORE',
    title: 'Autonomous SmartDesk Core - Dual Motor Electric Standing Desk (53x29")',
    category: 'furniture',
    retailer: 'Autonomous',
    price: 499.00,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 3,
    rating: 4.7,
    specs: {
      heightRange: '29.4" to 48"',
      weightCapacity: '270 lbs',
      motors: 'Quiet Dual Motor (<50dB)',
      warranty: '5-Year Frame & Motor'
    }
  },
  {
    id: 'prod-desk-02',
    sku: 'FEZIBO-DUAL-55',
    title: 'FEZIBO Electric Height Adjustable Standing Desk with Splice Board (55x24")',
    category: 'furniture',
    retailer: 'Amazon Business',
    price: 249.99,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    rating: 4.5,
    specs: {
      heightRange: '27.7" to 46.6"',
      presetMemory: '3 programmable buttons',
      material: 'Solid Steel Frame'
    }
  },
  {
    id: 'prod-chair-01',
    sku: 'HERMAN-MILLER-AERON-REM',
    title: 'Herman Miller Aeron Ergonomic Office Chair (Size B, Fully Loaded)',
    category: 'furniture',
    retailer: 'Design Within Reach Pro',
    price: 1195.00,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 5,
    rating: 4.9,
    specs: {
      lumbarSupport: 'PostureFit SL',
      material: '8Z Pellicle Mesh',
      warranty: '12-Year Warranty'
    }
  },
  {
    id: 'prod-chair-02',
    sku: 'ERGO-CHAIR-PRO',
    title: 'Autonomous ErgoChair Pro - Full Adjustable Mesh Desk Chair',
    category: 'furniture',
    retailer: 'Autonomous',
    price: 449.00,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 3,
    rating: 4.6,
    specs: {
      recline: '22° recline with 5 lockable positions',
      headrest: 'Adjustable height and angle',
      capacity: '300 lbs'
    }
  },

  // Peripherals & Docks
  {
    id: 'prod-dock-01',
    sku: 'CALDIGIT-TS4',
    title: 'CalDigit TS4 Thunderbolt 4 Dock (18 Ports, 98W Charging)',
    category: 'peripherals',
    retailer: 'CalDigit Store',
    price: 399.99,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    rating: 4.9,
    specs: {
      ports: '18 ports (3x TB4, 5x USB-A, 3x USB-C, 2.5GbE LAN, DisplayPort 1.4)',
      powerDelivery: '98W host charging',
      compatibility: 'macOS, Windows, Linux'
    }
  },
  {
    id: 'prod-dock-02',
    sku: 'ANKER-575-12IN1',
    title: 'Anker 575 USB-C Docking Station (12-in-1, Triple Display 85W)',
    category: 'peripherals',
    retailer: 'Anker Commercial',
    price: 149.99,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 1,
    rating: 4.6,
    specs: {
      ports: '12 ports (2x HDMI, DisplayPort, USB-C 10Gbps, Gigabit Ethernet)',
      powerDelivery: '85W pass-through',
      displays: 'Dual 4K / Triple 1080p'
    }
  },
  {
    id: 'prod-periph-01',
    sku: 'LOGI-MX-KEYS-COMBO',
    title: 'Logitech MX Master 3S Mouse & MX Mechanical Keyboard Combo for Business',
    category: 'peripherals',
    retailer: 'Logitech Business',
    price: 269.99,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    rating: 4.9,
    specs: {
      connectivity: 'Logi Bolt USB Receiver + Bluetooth LE',
      battery: 'Rechargeable USB-C (up to 70 days)',
      sensor: '8000 DPI Darkfield sensor'
    }
  },
  {
    id: 'prod-periph-02',
    sku: 'JABRA-EVOLVE2-65',
    title: 'Jabra Evolve2 65 Wireless Noise-Isolating Office Headset with Mic Boom',
    category: 'peripherals',
    retailer: 'CDW Logistics',
    price: 219.00,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    rating: 4.7,
    specs: {
      noiseCancellation: 'Passive noise-isolating foam',
      batteryLife: '37 hours',
      certification: 'Certified for Zoom, Teams, Meet'
    }
  }
];

export class CatalogService {
  /**
   * Search retail catalog based on keywords, category, and budget
   */
  static search(query: string, options?: { category?: string; maxPrice?: number }): ProductItem[] {
    const q = query.toLowerCase();
    return PRODUCT_CATALOG.filter(product => {
      const matchQuery = 
        product.title.toLowerCase().includes(q) ||
        product.retailer.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        Object.values(product.specs).some(s => s.toLowerCase().includes(q));

      const matchCategory = options?.category ? product.category === options.category : true;
      const matchPrice = options?.maxPrice ? product.price <= options.maxPrice : true;

      return matchQuery && matchCategory && matchPrice;
    });
  }

  static getById(id: string): ProductItem | undefined {
    return PRODUCT_CATALOG.find(p => p.id === id);
  }

  static getAll(): ProductItem[] {
    return [...PRODUCT_CATALOG];
  }
}

