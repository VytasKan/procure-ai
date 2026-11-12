import fs from 'fs';
import path from 'path';
import { 
  LedgerTransaction, 
  EscrowLifecycleStatus, 
  AgentServiceContract, 
  SellerAgentProfile 
} from '../types';
import { PayPalSettlementResult } from './paypal-client';

const DATA_FILE = path.join(process.cwd(), 'data', 'ledger.json');
const REGISTRY_FILE = path.join(process.cwd(), 'data', 'registry.json');

export const INITIAL_AGENTS: SellerAgentProfile[] = [
  {
    id: 'agent-ch3-harvester',
    handle: 'agent://harvester-b2b.eth',
    name: 'Harvester-v4 (Enterprise B2B Broker)',
    specialty: 'Direct B2B EDI & API integrations with Staples, Newegg Business, and CDW',
    trustScore: 96,
    stakeCollateralUsd: 2500,
    completedTasks: 184,
    disputeCount: 0,
    slaSuccessRate: 99.8,
    status: 'VERIFIED',
    supportedSuppliers: ['staples.com', 'newegg.com', 'dell.com', 'cdw.com'],
    brokerMarkupPercent: 2.5
  },
  {
    id: 'agent-price-pulse',
    handle: 'agent://pricepulse-broker.io',
    name: 'PricePulse-Broker-v2',
    specialty: 'Wholesale & volume discount fulfillment for Michaels, Uline, and Best Buy',
    trustScore: 78,
    stakeCollateralUsd: 800,
    completedTasks: 92,
    disputeCount: 1,
    slaSuccessRate: 94.5,
    status: 'VERIFIED',
    supportedSuppliers: ['michaels.com', 'bestbuy.com', 'uline.com'],
    brokerMarkupPercent: 2.0
  },
  {
    id: 'agent-shadow-scraper',
    handle: 'agent://shadow-broker.mesh',
    name: 'ShadowBroker-0x9',
    specialty: 'Secondary market broker for discount lots; unverified supplier routing',
    trustScore: 38,
    stakeCollateralUsd: 50,
    completedTasks: 19,
    disputeCount: 3,
    slaSuccessRate: 64.2,
    status: 'PROBATION',
    supportedSuppliers: ['michaels.com', 'overstock.com', 'gray-market-liquidators'],
    brokerMarkupPercent: 1.5
  },
  {
    id: 'agent-rogue-synth',
    handle: 'agent://rogue-fulfill.ai',
    name: 'RogueFulfill-AI (Flagged Broker)',
    specialty: 'Unverified spot broker; high rate of synthetic tracking numbers and failed delivery',
    trustScore: 24,
    stakeCollateralUsd: 0,
    completedTasks: 6,
    disputeCount: 5,
    slaSuccessRate: 31.0,
    status: 'FLAGGED',
    supportedSuppliers: ['borntostandout.com', 'unverified-dropshippers'],
    brokerMarkupPercent: 1.0
  }
];

class LedgerStore {
  private transactions: LedgerTransaction[] = [];
  private agents: SellerAgentProfile[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.transactions = parsed;
        }
      }
    } catch {
      // Ignore
    }

    try {
      if (fs.existsSync(REGISTRY_FILE)) {
        const rawReg = fs.readFileSync(REGISTRY_FILE, 'utf-8');
        const parsedReg = JSON.parse(rawReg);
        if (Array.isArray(parsedReg) && parsedReg.length > 0) {
          this.agents = parsedReg;
        } else {
          this.agents = [...INITIAL_AGENTS];
        }
      } else {
        this.agents = [...INITIAL_AGENTS];
      }
    } catch {
      this.agents = [...INITIAL_AGENTS];
    }

    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      const dataDir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.transactions, null, 2), 'utf-8');
      fs.writeFileSync(REGISTRY_FILE, JSON.stringify(this.agents, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save to ledger/registry storage:', e);
    }
  }

  getAll(): LedgerTransaction[] {
    return [...this.transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getById(id: string): LedgerTransaction | undefined {
    return this.transactions.find(tx => tx.id === id || tx.contractId === id);
  }

  getAgents(): SellerAgentProfile[] {
    return [...this.agents];
  }

  getAgentById(idOrHandle: string): SellerAgentProfile | undefined {
    return this.agents.find(a => a.id === idOrHandle || a.handle === idOrHandle || a.name.toLowerCase().includes(idOrHandle.toLowerCase()));
  }

  addFromContract(
    contract: AgentServiceContract,
    settlement: PayPalSettlementResult
  ): LedgerTransaction {
    const isEscrow = contract.requiresEscrow || settlement.actionType === 'ESCROW_AUTHORIZED';
    const status: EscrowLifecycleStatus = isEscrow ? 'ESCROW_LOCKED' : 'DIRECT_SETTLED';

    const selectedOffer = contract.sourcingProposal?.selectedOffer;
    const isRogue = contract.sellerAgent.id === 'agent-rogue-synth';
    const merchantDomain = contract.merchantDomain || selectedOffer?.merchantDomain || 'staples.com';
    const qty = contract.quantity || selectedOffer?.quantity || 100;

    const fulfillment = isEscrow
      ? {
          supplierName: merchantDomain,
          supplierPoNumber: `PO-${merchantDomain.split('.')[0].toUpperCase()}-${Date.now().toString().slice(-6)}`,
          carrier: isRogue ? 'UNKNOWN_CARRIER' : 'UPS Freight',
          trackingNumber: isRogue ? 'INVALID-TRACKING-0000' : `1Z999AA10${Date.now().toString().slice(-8)}`,
          status: isRogue ? ('INVALID_TRACKING_FRAUD' as const) : ('IN_TRANSIT_VERIFIED' as const),
          quantityShipped: isRogue ? 0 : qty
        }
      : {
          supplierName: merchantDomain,
          supplierPoNumber: `PO-${merchantDomain.split('.')[0].toUpperCase()}-${Date.now().toString().slice(-6)}`,
          carrier: 'FedEx Direct Ground',
          trackingNumber: `7849${Date.now().toString().slice(-8)}`,
          status: 'DELIVERED' as const,
          quantityShipped: qty
        };

    const proposal = contract.sourcingProposal;
    const wholesale = proposal?.wholesaleCost || contract.serviceFee * 0.9;
    const clientPaid = contract.totalAmount;
    const margin = Math.round((clientPaid - wholesale) * 100) / 100;
    const comm = proposal?.channel3Commission || Math.round((wholesale * 0.05) * 100) / 100;

    const itemsSummary = contract.items && contract.items.length > 0
      ? contract.items.map(it => `${it.quantity}x ${it.title}`).join(', ')
      : (selectedOffer?.title || contract.taskTitle);

    const totalQty = contract.items && contract.items.length > 0
      ? contract.items.reduce((s, it) => s + it.quantity, 0)
      : qty;

    const newTx: LedgerTransaction = {
      id: `tx-a2a-${Date.now().toString().slice(-6)}`,
      contractId: contract.contractId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: contract.taskTitle,
      buyerAgent: contract.buyerAgent,
      sellerAgentId: contract.sellerAgent.id,
      sellerAgentName: contract.sellerAgent.name,
      sellerAgentHandle: contract.sellerAgent.handle,
      sellerTrustScore: contract.sellerAgent.trustScore,
      stakeCollateral: contract.sellerAgent.stakeCollateralUsd,
      merchantDomain,
      procuredItem: itemsSummary,
      quantityProcured: totalQty,
      routingMode: contract.trustEvaluation.route,
      status,
      totalAmount: contract.totalAmount,
      clientPaidUsd: clientPaid,
      merchantCostUsd: wholesale,
      netMarginUsd: margin,
      channel3CommissionUsd: comm,
      channel3BuyUrl: proposal?.channel3BuyUrl,
      currency: contract.currency,
      deliverableCount: contract.items?.length || contract.sampleArtifacts.length || 1,
      paypalOrderId: settlement.orderId,
      paypalAuthId: settlement.authorizationId,
      paypalCaptureId: settlement.captureId,
      paypalPaymentUrl: settlement.approveUrl,
      paypalStatus: isEscrow ? 'AUTHORIZED' : 'CAPTURED',
      verificationNotes: isEscrow 
        ? `Funds held in PayPal Escrow (intent: AUTHORIZE). ProcureAI (Master Distributor) executing order with ${merchantDomain} and awaiting verified carrier tracking.`
        : `Direct settlement executed via PayPal CAPTURE. Client agent paid ProcureAI $${clientPaid.toFixed(2)}. ProcureAI settled $${wholesale.toFixed(2)} to ${merchantDomain} (Margin: +$${margin.toFixed(2)} + $${comm.toFixed(2)} Comm).`,
      fulfillment,
      sourcingProposal: contract.sourcingProposal,
      auditTrail: [
        {
          endpoint: isEscrow ? '/v2/checkout/orders [intent: AUTHORIZE]' : '/v2/checkout/orders [intent: CAPTURE]',
          method: 'POST',
          status: 200,
          timestamp: new Date().toISOString(),
          action: isEscrow ? 'AUTHORIZE' : 'CAPTURE',
          summary: isEscrow ? `Escrow authorization locked for ${contract.sellerAgent.name}` : `Direct payment captured to ProcureAI from ${contract.buyerAgent}`
        }
      ],
      artifacts: contract.items && contract.items.length > 0
        ? contract.items.map(it => ({
            name: it.title,
            sku: it.sku,
            retailer: 'ProcureAI Certified',
            unitPrice: it.unitPrice
          }))
        : contract.sampleArtifacts.map(it => ({
            name: it.title,
            sku: it.sku,
            retailer: it.retailer,
            unitPrice: it.price
          }))
    };

    this.transactions.unshift(newTx);
    this.saveToStorage();
    return newTx;
  }

  verifyAndCaptureEscrow(id: string, captureId: string): LedgerTransaction | undefined {
    const tx = this.transactions.find(t => t.id === id || t.contractId === id);
    if (tx && tx.status === 'ESCROW_LOCKED') {
      const agent = this.agents.find(a => a.id === tx.sellerAgentId || a.handle === tx.sellerAgentHandle);
      const currentScore = agent ? agent.trustScore : tx.sellerTrustScore;
      const newScore = Math.min(100, currentScore + 2);

      tx.status = 'VERIFIED_CAPTURED';
      tx.paypalCaptureId = captureId;
      tx.paypalStatus = 'CAPTURED';
      tx.sellerTrustScore = newScore;
      if (tx.fulfillment) {
        tx.fulfillment.status = 'DELIVERED';
      }
      tx.verificationNotes = `Carrier tracking verified for ${tx.merchantDomain || 'supplier'}. Escrow released to ${tx.sellerAgentName} via PayPal capture (${captureId}). Broker reputation +2.`;
      tx.updatedAt = new Date().toISOString();
      tx.auditTrail = tx.auditTrail || [];
      tx.auditTrail.push({
        endpoint: '/v2/payments/authorizations/{id}/capture',
        method: 'POST',
        status: 201,
        timestamp: new Date().toISOString(),
        action: 'CAPTURE',
        summary: `Escrow capture ${captureId} executed upon carrier tracking verification`
      });

      if (agent) {
        agent.trustScore = newScore;
        agent.completedTasks += 1;
        const total = agent.completedTasks + agent.disputeCount;
        agent.slaSuccessRate = total > 0 ? Math.min(100, Math.round(((agent.completedTasks / total) * 100) * 10) / 10) : 100;
        if (agent.trustScore >= 75) agent.status = 'VERIFIED';
        else if (agent.trustScore >= 40) agent.status = 'PROBATION';
        else agent.status = 'FLAGGED';
      }

      this.saveToStorage();
    }
    return tx;
  }

  disputeAndRefundEscrow(
    id: string, 
    refundId: string, 
    reason?: string, 
    refundAmount?: number,
    autoSlaSlashing: boolean = true
  ): LedgerTransaction | undefined {
    const tx = this.transactions.find(t => t.id === id || t.contractId === id);
    if (tx && tx.status === 'ESCROW_LOCKED') {
      const agent = this.agents.find(a => a.id === tx.sellerAgentId || a.handle === tx.sellerAgentHandle);
      const currentScore = agent ? agent.trustScore : tx.sellerTrustScore;
      const newScore = autoSlaSlashing ? Math.max(0, currentScore - 15) : currentScore;

      const amountToRefund = Math.min(tx.totalAmount, Math.max(0, refundAmount ?? tx.totalAmount));
      tx.status = 'DISPUTED_REFUNDED';
      tx.paypalRefundId = refundId;
      tx.paypalStatus = 'REFUNDED';
      tx.refundAmount = amountToRefund;
      tx.sellerTrustScore = newScore;
      if (tx.fulfillment) {
        tx.fulfillment.status = 'INVALID_TRACKING_FRAUD';
      }
      tx.verificationNotes = `Fulfillment Breach: ${reason || 'Failed carrier tracking verification'}. Restitution refund (${refundId}) of $${(tx.refundAmount).toFixed(2)} issued.${autoSlaSlashing ? ' Broker reputation slashed -15.' : ''}`;
      tx.updatedAt = new Date().toISOString();
      tx.auditTrail = tx.auditTrail || [];
      tx.auditTrail.push({
        endpoint: refundId.startsWith('VOID') ? '/v2/payments/authorizations/{id}/void' : '/v2/payments/captures/{id}/refund',
        method: 'POST',
        status: 201,
        timestamp: new Date().toISOString(),
        action: 'REFUND',
        summary: `${refundId.startsWith('VOID') ? 'Authorization voided' : `Refund ${refundId} issued for $${(tx.refundAmount).toFixed(2)}`} due to supplier/broker fulfillment failure`
      });

      if (agent) {
        agent.trustScore = newScore;
        agent.disputeCount += 1;
        const total = agent.completedTasks + agent.disputeCount;
        agent.slaSuccessRate = total > 0 ? Math.max(0, Math.round(((agent.completedTasks / total) * 100) * 10) / 10) : 0;
        if (agent.trustScore < 40) agent.status = 'FLAGGED';
        else if (agent.trustScore < 75) agent.status = 'PROBATION';
        else agent.status = 'VERIFIED';
      }

      this.saveToStorage();
    }
    return tx;
  }
}

const globalStore = globalThis as unknown as { __procureAILedgerStoreV3?: LedgerStore };
if (!globalStore.__procureAILedgerStoreV3 || typeof globalStore.__procureAILedgerStoreV3.getAgents !== 'function') {
  globalStore.__procureAILedgerStoreV3 = new LedgerStore();
}
export const ledgerStore = globalStore.__procureAILedgerStoreV3;
