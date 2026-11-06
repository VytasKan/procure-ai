export interface ProductItem {
  id: string;
  sku: string;
  title: string;
  category: 'hardware' | 'furniture' | 'peripherals' | 'software' | 'office_supplies';
  retailer: string;
  price: number;
  currency: string;
  inStock: boolean;
  leadTimeDays: number;
  specs: Record<string, string>;
  rating: number;
  imageUrl?: string;
}

export interface ProcurementQuote {
  quoteId: string;
  title: string;
  description: string;
  items: {
    product: ProductItem;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  subtotal: number;
  estimatedTax: number;
  shippingCost: number;
  bulkDiscount: number;
  totalAmount: number;
  currency: string;
  vendorNotes: string;
  estimatedDeliveryDate: string;
  requiresApproval: boolean;
  approvalReason?: string;
  paymentMethod: 'PAYPAL_ORDER' | 'PAYPAL_INVOICE';
}

export type OrderStatus = 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'PAYPAL_PROCESSING' 
  | 'COMPLETED' 
  | 'SHIPPED' 
  | 'CANCELLED';

export interface LedgerTransaction {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  department: string;
  requestedBy: string;
  supplier: string;
  itemCount: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paypalOrderId?: string;
  paypalInvoiceId?: string;
  paypalPaymentUrl?: string;
  paypalStatus?: string;
  trackingNumber?: string;
  carrier?: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  quote?: ProcurementQuote;
  paypalAction?: {
    type: 'ORDER_CREATED' | 'INVOICE_SENT' | 'TRACKING_UPDATED';
    id: string;
    url?: string;
  };
}

export interface GuardrailSettings {
  maxAutoApprovalAmount: number; // e.g. $250
  preferredCurrencies: string[];
  restrictedVendors: string[];
}

