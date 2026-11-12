import { ProductItem, CandidateSupplierOffer } from '../types';
import { ENV } from '../config/env';

/**
 * Deterministic multi-merchant B2B catalog items including the flagship
 * pen procurement scenario and workstation electronics with rich images, descriptions,
 * bulk packaging variants, and multi-merchant alternative offers.
 */
const SEED_ARTIFACTS: ProductItem[] = [
  // Flagship 100/5000 Pens Scenario (Raw Channel3 Multi-Merchant Offers)
  {
    id: 'ch3-pen-staples',
    sku: 'CH3-STAPLES-BIC-ROUND',
    title: 'BIC Round Stic Grip Extra Life Ballpoint Pens, Medium Point (0.8mm), Black, Bulk',
    description: 'The standard office workhorse. Features a soft grip for comfortable writing, translucent barrel showing ink supply, and BIC’s exclusive ink system technology for smooth, uninterrupted lines.',
    category: 'office_supplies',
    retailer: 'staples.com',
    price: 0.28,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 3,
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
    specs: { Point: '0.8mm Medium', Ink: 'Black Oil-Based', Packaging: 'Box of 144 (Bulk Wholesale)', B2B_Contract: 'Staples Advantage B2B', Country_Origin: 'USA' },
    rating: 4.8,
    merchantTrustScore: 94,
    trustVerdict: 'APPROVED',
    trustVerdictReason: 'Verified Fortune 500 Enterprise Vendor; valid US VAT/Tax ID; direct B2B EDI integration active',
    assignedBrokerId: 'agent-ch3-harvester',
    assignedBrokerName: 'Harvester-v4 (Enterprise B2B Broker)',
    brokerMarkupPercent: 2.5,
    variants: [
      { id: 'var-staples-144', name: 'Box of 144 (Bulk Wholesale)', packCount: 144, unitPrice: 0.28, packPrice: 40.32, inStock: true, sku: 'STP-BIC-144' },
      { id: 'var-staples-60', name: 'Box of 60 (Standard Office)', packCount: 60, unitPrice: 0.31, packPrice: 18.60, inStock: true, sku: 'STP-BIC-60' },
      { id: 'var-staples-12', name: 'Pack of 12 (Sample Retail)', packCount: 12, unitPrice: 0.42, packPrice: 5.04, inStock: true, sku: 'STP-BIC-12' }
    ],
    alternativeOffers: [
      { merchantDomain: 'staples.com', merchantName: 'Staples B2B Advantage', unitPrice: 0.28, packPrice: 40.32, inStock: true, deliveryDays: 3, trustScore: 94, verdict: 'APPROVED', isAllowlisted: true },
      { merchantDomain: 'newegg.com', merchantName: 'Newegg Business', unitPrice: 0.31, packPrice: 44.64, inStock: true, deliveryDays: 2, trustScore: 88, verdict: 'APPROVED', isAllowlisted: true },
      { merchantDomain: 'michaels.com', merchantName: 'Michaels Wholesale', unitPrice: 0.35, packPrice: 50.40, inStock: true, deliveryDays: 5, trustScore: 64, verdict: 'ESCROW_REVIEW', isAllowlisted: false }
    ]
  },
  {
    id: 'ch3-pen-newegg',
    sku: 'CH3-NEWEGG-SHARPIE-GEL',
    title: 'Sharpie S-Gel Gel Pens, Medium Point (0.7mm), No Smear, Matte Black Office Pack',
    description: 'High-performance gel pen with no-smear, no-bleed technology. Intensely bold black gel ink delivers always-vivid writing on legal documents and contracts.',
    category: 'office_supplies',
    retailer: 'newegg.com',
    price: 0.32,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&auto=format&fit=crop&q=80',
    specs: { Point: '0.7mm Gel', Ink: 'Ultra-Black Quick Dry', Supplier: 'Newegg Business Official', Grip: 'Contoured Rubber' },
    rating: 4.7,
    merchantTrustScore: 88,
    trustVerdict: 'APPROVED',
    trustVerdictReason: 'Verified Corporate Wholesaler; Dun & Bradstreet active; PayPal B2B merchant authorized',
    assignedBrokerId: 'agent-ch3-harvester',
    assignedBrokerName: 'Harvester-v4 (Enterprise B2B Broker)',
    brokerMarkupPercent: 2.5,
    variants: [
      { id: 'var-newegg-100', name: 'Master Carton (100 Pens)', packCount: 100, unitPrice: 0.32, packPrice: 32.00, inStock: true, sku: 'NWG-SGEL-100' },
      { id: 'var-newegg-36', name: 'Office Bundle (36 Pens)', packCount: 36, unitPrice: 0.36, packPrice: 12.96, inStock: true, sku: 'NWG-SGEL-36' }
    ],
    alternativeOffers: [
      { merchantDomain: 'newegg.com', merchantName: 'Newegg Business', unitPrice: 0.32, packPrice: 32.00, inStock: true, deliveryDays: 2, trustScore: 88, verdict: 'APPROVED', isAllowlisted: true },
      { merchantDomain: 'staples.com', merchantName: 'Staples Advantage', unitPrice: 0.34, packPrice: 34.00, inStock: true, deliveryDays: 3, trustScore: 94, verdict: 'APPROVED', isAllowlisted: true }
    ]
  },
  {
    id: 'ch3-pen-michaels',
    sku: 'CH3-MICHAELS-BULK-PEN',
    title: 'Artist Loft & Office Ballpoint Black Value Pack (Bulk Tier 2)',
    description: 'Bulk economy ballpoint pens intended for institutional high-turnover use. Dependable ink feed with medium ball point.',
    category: 'office_supplies',
    retailer: 'michaels.com',
    price: 0.35,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?w=600&auto=format&fit=crop&q=80',
    specs: { Point: '1.0mm Bold', Packaging: 'Box of 100', Channel: 'Michaels Wholesale', Certification: 'ISO 12757-2' },
    rating: 4.3,
    merchantTrustScore: 64,
    trustVerdict: 'ESCROW_REVIEW',
    trustVerdictReason: 'Secondary wholesale channel; new integration tier. Requires PayPal Escrow authorization.',
    assignedBrokerId: 'agent-price-pulse',
    assignedBrokerName: 'PricePulse-Broker-v2',
    brokerMarkupPercent: 2.0,
    variants: [
      { id: 'var-michaels-100', name: 'Bulk Box of 100', packCount: 100, unitPrice: 0.35, packPrice: 35.00, inStock: true, sku: 'MCH-PEN-100' }
    ]
  },
  {
    id: 'ch3-pen-borntostandout',
    sku: 'CH3-BORN-PEN-SSB',
    title: 'pen - ㅆㅂ (Unbranded Bulk Ballpoint Liquidator Lot)',
    description: 'Mixed liquidator overrun from unverified suppliers. Unknown ink composition, no warranty, non-refundable dropship parcel.',
    category: 'office_supplies',
    retailer: 'borntostandout.com',
    price: 0.18,
    currency: 'USD',
    inStock: false,
    leadTimeDays: 30,
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80',
    specs: { Origin: 'Unverified Overseas Dropshipper', Warranty: 'None', ReturnPolicy: 'No Returns', ShellEntity: 'Yes' },
    rating: 2.1,
    merchantTrustScore: 12,
    trustVerdict: 'UNVERIFIED',
    trustVerdictReason: 'CRITICAL RISK: Unregistered shell entity; no VAT match; dropship fraud flag. BLOCKED BY PROCUREAI.',
    assignedBrokerId: 'agent-rogue-synth',
    assignedBrokerName: 'RogueFulfill-AI (Flagged Broker)',
    brokerMarkupPercent: 1.0,
    variants: [
      { id: 'var-born-100', name: 'Liquidation Pallet (100 loose)', packCount: 100, unitPrice: 0.18, packPrice: 18.00, inStock: false, sku: 'BRN-SSB-100' }
    ]
  },

  // Peripherals & Workstations
  {
    id: 'ch3-live-101',
    sku: 'CH3-DELL-U2723QE',
    title: 'Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE)',
    description: 'Premier 27-inch 4K monitor featuring IPS Black technology with 2000:1 contrast ratio, 90W USB-C power delivery hub, and built-in RJ45 Ethernet.',
    category: 'hardware',
    retailer: 'dell.com',
    price: 489.99,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    specs: { Resolution: '3840 x 2160', Panel: 'IPS Black', USB_C_PD: '90W Power Delivery', Warranty: '3-Yr Advanced Exchange' },
    rating: 4.9,
    merchantTrustScore: 98,
    trustVerdict: 'APPROVED',
    trustVerdictReason: 'Tier-1 Direct OEM Manufacturer; Verified Enterprise Allowlist',
    assignedBrokerId: 'agent-ch3-harvester',
    assignedBrokerName: 'Harvester-v4 (Enterprise B2B Broker)',
    brokerMarkupPercent: 2.5
  },
  {
    id: 'ch3-live-102',
    sku: 'CH3-LOGI-MX3S',
    title: 'Logitech MX Master 3S Wireless Performance Mouse',
    description: 'Ergonomic performance mouse with 8000 DPI track-on-glass sensor, quiet clicks, and MagSpeed electromagnetic scrolling.',
    category: 'peripherals',
    retailer: 'bestbuy.com',
    price: 99.99,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 1,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    specs: { DPI: '8000 DPI Darkfield', Connectivity: 'Bluetooth / Logi Bolt', Battery: '70 Days', Flow_Control: 'Multi-Computer' },
    rating: 4.8,
    merchantTrustScore: 91,
    trustVerdict: 'APPROVED',
    trustVerdictReason: 'Verified Retail Network; Instant PayPal Settlement Cleared',
    assignedBrokerId: 'agent-price-pulse',
    assignedBrokerName: 'PricePulse-Broker-v2',
    brokerMarkupPercent: 2.0
  },
  {
    id: 'ch3-live-105',
    sku: 'CH3-SONY-WH1000XM5',
    title: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    description: 'Industry-leading noise canceling with two processors and 8 microphones. Crystal clear hands-free calling with precise voice pickup.',
    category: 'peripherals',
    retailer: 'newegg.com',
    price: 398.00,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 1,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    specs: { Noise_Cancellation: 'Auto NC Optimizer with 8 Mics', Battery: '30 Hours', Multi_Point: '2 Devices' },
    rating: 4.85,
    merchantTrustScore: 88,
    trustVerdict: 'APPROVED',
    trustVerdictReason: 'Verified Merchant; Direct settlement approved',
    assignedBrokerId: 'agent-ch3-harvester',
    assignedBrokerName: 'Harvester-v4 (Enterprise B2B Broker)',
    brokerMarkupPercent: 2.5
  }
];

function mapChannel3Product(p: any, quantity: number = 100): ProductItem {
  const offer = p.offers?.[0];
  const price = offer?.price?.price ? Number(offer.price.price) : 0.50;
  const currency = offer?.price?.currency || 'USD';
  const retailerDomain = offer?.domain || (p.brands?.[0]?.name ? `${p.brands[0].name}.com` : 'authorized-merchant.com');
  const mainImg = p.images?.find((img: any) => img.is_main_image)?.url || p.images?.[0]?.url || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80';

  let trustScore = 76;
  let verdict: ProductItem['trustVerdict'] = 'APPROVED';
  let reason = 'Domain matches verified commerce registry';
  let brokerId = 'agent-ch3-harvester';
  let brokerName = 'Harvester-v4 (Enterprise B2B Broker)';

  const domainLower = retailerDomain.toLowerCase();
  if (domainLower.includes('borntostandout') || domainLower.includes('dropship') || domainLower.includes('cheap')) {
    trustScore = 14;
    verdict = 'UNVERIFIED';
    reason = 'Unregistered merchant entity. Blocked by ProcureAI.';
    brokerId = 'agent-rogue-synth';
    brokerName = 'RogueFulfill-AI (Flagged Broker)';
  } else if (domainLower.includes('michaels') || domainLower.includes('liquidat') || domainLower.includes('surplus')) {
    trustScore = 62;
    verdict = 'ESCROW_REVIEW';
    reason = 'Secondary wholesale catalog. Requires PayPal Escrow authorization.';
    brokerId = 'agent-shadow-scraper';
    brokerName = 'ShadowBroker-0x9';
  } else if (domainLower.includes('staples') || domainLower.includes('dell') || domainLower.includes('newegg') || domainLower.includes('bestbuy')) {
    trustScore = 92;
    verdict = 'APPROVED';
    reason = 'Verified B2B enterprise supplier with active EDI adapter.';
  }

  const desc = p.description || p.short_description || `Verified commerce catalog item: ${p.title}. Sourced via Channel3 Live Graph API.`;

  return {
    id: p.id || `ch3-${Math.random().toString(36).substring(7)}`,
    sku: `CH3-${(p.brands?.[0]?.name || 'SKU').toUpperCase()}-${p.id || Math.random().toString(36).substring(7)}`,
    title: p.title,
    description: desc,
    category: 'office_supplies',
    retailer: retailerDomain,
    price: price,
    currency,
    inStock: offer?.availability ? offer.availability === 'InStock' : true,
    leadTimeDays: 3,
    specs: { merchant: retailerDomain, condition: offer?.condition || 'New', brand: p.brands?.[0]?.name || 'Standard' },
    rating: p.ratings?.value ? Math.round(p.ratings.value * 10) / 10 : 4.6,
    imageUrl: mainImg,
    requestedQuantity: quantity,
    totalPrice: Math.round(price * quantity * 100) / 100,
    merchantTrustScore: trustScore,
    trustVerdict: verdict,
    trustVerdictReason: reason,
    assignedBrokerId: brokerId,
    assignedBrokerName: brokerName,
    brokerMarkupPercent: 2.5,
    variants: [
      { id: `var-${p.id}-bulk`, name: `Bulk Pack (${quantity} units)`, packCount: quantity, unitPrice: price, packPrice: Math.round(price * quantity * 100) / 100, inStock: true, sku: `VAR-BLK-${p.id}` }
    ]
  };
}

export class CatalogService {
  private static liveItemCache: Map<string, ProductItem> = new Map();

  /**
   * Step 1: Discovery (/search)
   * Queries Channel3 for matching product candidates
   */
  static async searchAsync(
    query: string,
    options?: { category?: string; maxPrice?: number; limit?: number; quantity?: number }
  ): Promise<ProductItem[]> {
    const qty = options?.quantity || 100;
    const lower = (query || '').toLowerCase();

    // 1. Check if user is looking for pens / office supplies -> Return the rich multi-merchant comparative offers
    if (lower.includes('pen') || lower.includes('ballpoint') || lower.includes('sharpie') || lower.includes('bic')) {
      const results = SEED_ARTIFACTS.filter(i => i.category === 'office_supplies').map(item => ({
        ...item,
        requestedQuantity: qty,
        totalPrice: Math.round(item.price * qty * 100) / 100
      }));
      results.forEach(it => CatalogService.liveItemCache.set(it.id, it));
      return results;
    }

    // 2. Try live Channel3 API (/search) if configured for any product (desks, monitors, laptops, chairs, etc.)
    if (ENV.CHANNEL3_API_KEY) {
      try {
        const res = await fetch('https://api.trychannel3.com/v1/search', {
          method: 'POST',
          headers: {
            'x-api-key': ENV.CHANNEL3_API_KEY,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            query: query || 'office computer workstation desk supplies',
            limit: options?.limit || 6
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products) && data.products.length > 0) {
            const items = data.products.map((p: any) => mapChannel3Product(p, qty));
            items.forEach((it: ProductItem) => CatalogService.liveItemCache.set(it.id, it));
            return items;
          }
        }
      } catch (err) {
        console.warn('Channel3 live search error; using verified seed fallback:', err);
      }
    }

    // 3. Filter deterministic fallback catalog
    const filtered = SEED_ARTIFACTS.filter(item => {
      if (options?.category && item.category !== options.category) return false;
      if (options?.maxPrice && item.price > options.maxPrice) return false;
      if (!lower) return true;
      return (
        item.title.toLowerCase().includes(lower) ||
        item.retailer.toLowerCase().includes(lower) ||
        item.sku.toLowerCase().includes(lower)
      );
    });

    const results = filtered.length > 0 ? filtered : SEED_ARTIFACTS;
    const mapped = results.map(item => ({
      ...item,
      requestedQuantity: qty,
      totalPrice: Math.round(item.price * qty * 100) / 100
    })).slice(0, options?.limit || 8);
    mapped.forEach(it => CatalogService.liveItemCache.set(it.id, it));
    return mapped;
  }

  /**
   * Step 2: Enrichment & Details (/products/{id} or /lookup)
   * Fetches high-res images, full specs, packaging variants, and multi-merchant offers
   */
  static async getProductDetails(productId: string): Promise<ProductItem | undefined> {
    const cached = CatalogService.liveItemCache.get(productId);
    if (cached) return cached;

    // Check seed artifacts
    const seed = SEED_ARTIFACTS.find(i => i.id === productId || i.sku === productId);
    if (seed) return seed;

    // If live API is configured, call /v1/products/{id}
    if (ENV.CHANNEL3_API_KEY) {
      try {
        const res = await fetch(`https://api.trychannel3.com/v1/products/${productId}`, {
          method: 'GET',
          headers: { 'x-api-key': ENV.CHANNEL3_API_KEY }
        });
        if (res.ok) {
          const p = await res.json();
          const item = mapChannel3Product(p);
          CatalogService.liveItemCache.set(item.id, item);
          return item;
        }
      } catch (err) {
        console.warn('Channel3 /products enrichment error:', err);
      }
    }

    return undefined;
  }

  static async getInitialCatalog(quantity: number = 100): Promise<ProductItem[]> {
    return CatalogService.searchAsync('pens', { quantity });
  }

  static getBySku(sku: string): ProductItem | undefined {
    const lowerSku = sku.toLowerCase();
    for (const item of CatalogService.liveItemCache.values()) {
      if (item.sku.toLowerCase() === lowerSku) return item;
    }
    return SEED_ARTIFACTS.find(i => i.sku.toLowerCase() === lowerSku);
  }
}
