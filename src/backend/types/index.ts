export interface ProductVariant {
  id: string;
  name: string; // e.g. "Box of 12", "Box of 144 (Bulk Wholesale)", "Single Unit"
  packCount: number;
  unitPrice: number;
  packPrice: number;
  inStock: boolean;
  sku: string;
}

export interface SupplierOfferComparison {
  merchantDomain: string;
  merchantName: string;
  unitPrice: number;
  packPrice: number;
  inStock: boolean;
  deliveryDays: number;
  trustScore: number;
  verdict: 'APPROVED' | 'ESCROW_REVIEW' | 'UNVERIFIED';
  isAllowlisted: boolean;
}

export interface ProductItem {
  id: string;
  sku: string;
  title: string;
  description?: string;
  category: 'hardware' | 'peripherals' | 'software' | 'consumer_electronics' | 'office_supplies';
  retailer: string; // Merchant Domain e.g. staples.com, newegg.com
  price: number; // Unit Price
  currency: string;
  inStock: boolean;
  leadTimeDays: number;
  specs: Record<string, string>;
  rating: number;
  imageUrl?: string;
  // B2B Procurement & Qualification Fields
  requestedQuantity?: number;
  totalPrice?: number;
  merchantTrustScore?: number; // 0 - 100
  trustVerdict?: 'APPROVED' | 'ESCROW_REVIEW' | 'UNVERIFIED';
  trustVerdictReason?: string;
  assignedBrokerId?: string;
  assignedBrokerName?: string;
  brokerMarkupPercent?: number;
  // Step 2 Enrichment: Full Details & Variants
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant;
  alternativeOffers?: SupplierOfferComparison[];
  // Price Intelligence & Fulfillment Options
  priceHistory?: { date: string; price: number }[];
  priceTrend?: 'falling' | 'stable' | 'rising';
  targetPriceAlert?: number;
  procureAiOffers?: {
    tier: 'instant' | 'standard' | 'bulk_deferred';
    title: string;
    unitPrice: number;
    totalPrice: number;
    leadTime: string;
    description: string;
    savingsPct?: number;
  }[];
}

export type AgentStatus = 'VERIFIED' | 'PROBATION' | 'FLAGGED';

export interface SellerAgentProfile {
  id: string;
  handle: string;
  name: string;
  specialty: string;
  trustScore: number; // 0 - 100
  stakeCollateralUsd: number;
  completedTasks: number;
  disputeCount: number;
  slaSuccessRate: number; // e.g. 98.5%
  status: AgentStatus;
  supportedSuppliers?: string[];
  brokerMarkupPercent?: number;
}

export type EscrowRouteType = 'INSTANT_DIRECT' | 'CONDITIONAL_ESCROW';

export interface TrustEvaluation {
  score: number;
  threshold: number;
  route: EscrowRouteType;
  riskFlags: string[];
  collateralRatio: number;
  recommendation: string;
  merchantScore?: number;
  merchantVerdict?: 'APPROVED' | 'ESCROW_REVIEW' | 'UNVERIFIED';
  riskSpreadPercent?: number; // e.g. 3.5%, 6.0% risk surcharge when score < threshold
  riskSurchargeUsd?: number;  // Dynamic risk fee charged to client instead of blocking
}

export type TaskType = 'B2B_PROCUREMENT' | 'CATALOG_HARVEST' | 'PRICE_SCRAPE' | 'SKU_AUDIT';

export interface CandidateSupplierOffer {
  offerId: string;
  productId: string;
  title: string;
  merchantDomain: string;
  unitPrice: number;
  quantity: number;
  subtotalPrice: number;
  inStock: boolean;
  leadTimeDays: number;
  merchantScore: number;
  verdict: 'APPROVED' | 'ESCROW_REVIEW' | 'UNVERIFIED';
  verdictReason: string;
  assignedBrokerId: string;
  assignedBrokerName: string;
  imageUrl?: string;
  description?: string;
  selectedVariantName?: string;
}

export interface SourcingProposal {
  userIntent: string;
  quantity: number;
  semanticQueries: string[];
  rawOffersScanned: number;
  candidateOffers: CandidateSupplierOffer[];
  selectedOffer: CandidateSupplierOffer;
  wholesaleCost: number;       // What we pay merchant via corporate B2B account
  brokerFee: number;           // Our distributor markup fee
  channel3Commission?: number; // Affiliate commission from Channel3
  channel3BuyUrl?: string;     // Channel3 affiliate buy link
  totalContractAmount: number; // Total client agent pays via PayPal
}

export interface BasketItem {
  id: string;
  title: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  leadTimeDays: number;
  imageUrl?: string;
  category?: string;
}

export interface AgentServiceContract {
  contractId: string;
  buyerAgent: string;
  sellerAgent: SellerAgentProfile; // The Procurement Broker
  taskTitle: string;
  taskType: TaskType;
  description: string;
  serviceFee: number; // Wholesale + Broker Fee
  escrowFee: number;
  stakeRequired: number;
  totalAmount: number;
  currency: string;
  estimatedDeliveryTime: string;
  trustEvaluation: TrustEvaluation;
  sampleArtifacts: ProductItem[];
  requiresEscrow: boolean;
  disputePolicy: string;
  sourcingProposal?: SourcingProposal;
  merchantDomain?: string;
  quantity?: number;
  items?: BasketItem[];
}

export type EscrowLifecycleStatus =
  | 'DIRECT_SETTLED'
  | 'ESCROW_LOCKED'
  | 'VERIFIED_CAPTURED'
  | 'DISPUTED_REFUNDED'
  | 'CANCELLED';

export interface PayPalAuditLog {
  endpoint: string;
  method: 'POST' | 'GET';
  status: number;
  timestamp: string;
  action: 'AUTHORIZE' | 'CAPTURE' | 'REFUND' | 'PAYOUT';
  summary: string;
}

export interface FulfillmentProof {
  supplierName: string;
  supplierPoNumber: string;
  carrier: string;
  trackingNumber: string;
  status: 'IN_TRANSIT_VERIFIED' | 'INVALID_TRACKING_FRAUD' | 'DELIVERED';
  quantityShipped: number;
}

export interface LedgerTransaction {
  id: string;
  contractId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  buyerAgent: string;
  sellerAgentId: string; // Procurement Broker / Master Distributor
  sellerAgentName: string;
  sellerAgentHandle: string;
  sellerTrustScore: number;
  stakeCollateral: number;
  merchantDomain?: string;
  procuredItem?: string;
  quantityProcured?: number;
  routingMode: EscrowRouteType;
  status: EscrowLifecycleStatus;
  totalAmount: number; // Client paid (total)
  clientPaidUsd?: number; // Two-Sided Accounting: Client paid us via PayPal
  merchantCostUsd?: number; // Two-Sided Accounting: We paid merchant via corporate card/B2B EDI
  netMarginUsd?: number; // Platform markup profit kept ($)
  channel3CommissionUsd?: number; // Channel3 affiliate kickback ($)
  channel3BuyUrl?: string; // Channel3 affiliate fulfillment link
  currency: string;
  deliverableCount: number;
  paypalOrderId?: string;
  paypalAuthId?: string;
  paypalCaptureId?: string;
  paypalRefundId?: string;
  paypalPaymentUrl?: string;
  paypalStatus?: string;
  verificationNotes?: string;
  refundAmount?: number;
  fulfillment?: FulfillmentProof;
  sourcingProposal?: SourcingProposal;
  auditTrail?: PayPalAuditLog[];
  artifacts: {
    name: string;
    sku: string;
    retailer: string;
    unitPrice: number;
  }[];
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  conversation_id?: string;
  suggestions?: string[];
  products?: {
    id?: string;
    title: string;
    price: number;
    currency?: string;
    brand?: string;
    retailer?: string;
    imageUrl?: string;
    productUrl?: string;
    description?: string;
  }[];
  reasoningSteps?: string[];
  contract?: AgentServiceContract;
  deliveryPending?: {
    contractId: string;
    transactionId?: string;
    sellerAgent: SellerAgentProfile;
    fulfillment?: FulfillmentProof;
    artifacts: ProductItem[];
    isFailureSimulation?: boolean;
    failureReason?: string;
  };
  paypalAction?: {
    type: 'DIRECT_CAPTURE' | 'ESCROW_AUTHORIZED' | 'VERIFIED_CAPTURED' | 'DISPUTED_REFUNDED';
    id: string;
    url?: string;
  };
}

export interface ProcureAIPolicySettings {
  minTrustScoreThreshold: number; // default 75
  minStakeRequiredUsd: number;
  autoRefundOnDispute: boolean;
}
