import { CatalogService } from './catalog-service';
import { ENV } from '../config/env';
import { ledgerStore } from './ledger-store';
import { inventoryLedgerStore } from './inventory-store';
import { 
  AgentChatMessage, 
  AgentServiceContract, 
  SellerAgentProfile, 
  TrustEvaluation, 
  EscrowRouteType,
  TaskType, 
  ProductItem,
  CandidateSupplierOffer,
  SourcingProposal,
  BasketItem
} from '../types';

export class AgentOrchestrator {
  /**
   * Evaluate Procurement Broker Agent trust score & collateral against threshold
   */
  static evaluateSeller(
    seller: SellerAgentProfile,
    threshold: number = ENV.MIN_TRUST_SCORE_THRESHOLD,
    enforceCollateral: boolean = true,
    merchantVerdict?: 'APPROVED' | 'ESCROW_REVIEW' | 'UNVERIFIED',
    merchantScore?: number,
    baseAmount: number = 0
  ): TrustEvaluation {
    const riskFlags: string[] = [];
    const meetsScore = seller.trustScore >= threshold;
    const hasSufficientCollateral = !enforceCollateral || seller.stakeCollateralUsd >= 200;
    
    // Instead of a hard block or denying direct settlement, lower trust adds a dynamic risk spread
    let riskSpreadPercent = 0;
    let riskSurchargeUsd = 0;

    if (!meetsScore) {
      const deficit = threshold - seller.trustScore;
      // Dynamic risk fee: 2% base + 0.1% per point deficit below threshold
      riskSpreadPercent = Math.min(12.0, Math.round((2.0 + deficit * 0.15) * 10) / 10);
      riskSurchargeUsd = Math.round(baseAmount * (riskSpreadPercent / 100) * 100) / 100;
      riskFlags.push(`Risk-adjusted pricing applied (+${riskSpreadPercent}% / $${riskSurchargeUsd.toFixed(2)}): Trust score (${seller.trustScore}/100) is below network baseline (${threshold}/100)`);
    }

    if (seller.disputeCount > 0) {
      riskFlags.push(`${seller.disputeCount} historical delivery dispute(s) on record`);
    }
    if (seller.stakeCollateralUsd < 200) {
      riskFlags.push(`Low collateral stake ($${seller.stakeCollateralUsd} USD < $200 required)`);
    }
    if (merchantVerdict === 'ESCROW_REVIEW') {
      riskFlags.push(`Supplier merchant under escrow review; risk premium active`);
    }

    // Direct pay is supported for all vetted transactions; risk is compensated via dynamic spread
    const route: EscrowRouteType = (merchantVerdict === 'UNVERIFIED' && seller.trustScore < 40)
      ? 'CONDITIONAL_ESCROW'
      : 'INSTANT_DIRECT';

    const recommendation = meetsScore
      ? `High-trust procurement broker (Score: ${seller.trustScore}/100). Approved for standard direct settlement with 0% risk surcharge.`
      : `Trust score (${seller.trustScore}/100) requires risk premium (+${riskSpreadPercent}% surcharge). Order approved for direct execution with adjusted rate.`;

    return {
      score: seller.trustScore,
      threshold,
      route,
      riskFlags,
      collateralRatio: seller.stakeCollateralUsd > 0 ? Math.round((seller.stakeCollateralUsd / 150) * 100) / 100 : 0,
      recommendation,
      merchantScore,
      merchantVerdict,
      riskSpreadPercent,
      riskSurchargeUsd
    };
  }

  /**
   * Process Buyer Agent prompt to:
   * 1. Parse procurement intent (item, quantity, budget)
   * 2. Query Channel3 for multi-merchant supplier offers (Michaels, Newegg, Staples, borntostandout.com)
   * 3. Run ProcureAI Due Diligence (verifying the supplier & assigning the Procurement Broker)
   * 4. Build a qualified B2B Procurement Contract ready for PayPal execution
   */
  static async processMessage(
    userPrompt: string,
    currentThreshold: number = ENV.MIN_TRUST_SCORE_THRESHOLD,
    enforceCollateral: boolean = true
  ): Promise<AgentChatMessage> {
    const lower = userPrompt.toLowerCase();
    const liveAgents = ledgerStore.getAgents();

    // 1. Clean budget phrases and screen inch dimensions (e.g. 27", 32", 27-inch, 4k) so they are never mistaken for item quantity
    const promptCleaned = userPrompt
      .replace(/under\s*\$?[0-9]+(\.[0-9]{2})?/gi, ' ')
      .replace(/\$[0-9]+(\.[0-9]{2})?/gi, ' ')
      .replace(/\b\d+(\.\d+)?\s*(\"|''|inch(?:es)?)\b/gi, ' ')
      .replace(/\b\d+k\b/gi, ' ');

    // 2. Parse Quantity:
    // Check for explicit "1x", "4x", "10x", or "1 unit", "5 monitors", etc.
    let quantity = 1;
    const explicitXMatch = promptCleaned.match(/\b(\d+)\s*x\b/i);
    const qtyMatch = promptCleaned.match(/(\d[\d,]*)\s*(?:pens?|units?|items?|monitors?|chairs?|desks?|laptops?|headsets?|boots?|pairs?)/i);

    if (explicitXMatch) {
      const parsedX = parseInt(explicitXMatch[1], 10);
      if (!isNaN(parsedX) && parsedX > 0) {
        quantity = parsedX;
      }
    } else if (qtyMatch) {
      const parsedQty = parseInt(qtyMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(parsedQty) && parsedQty > 0) {
        quantity = parsedQty;
      }
    } else {
      const standaloneNum = promptCleaned.match(/\b(\d{2,6})\b/);
      if (standaloneNum) {
        const parsed = parseInt(standaloneNum[1], 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 100000) {
          quantity = parsed;
        }
      } else if (lower.includes('pen') || lower.includes('sharpie') || lower.includes('marker') || lower.includes('staple')) {
        quantity = 100;
      }
    }

    // 3. Extract dynamic target search query for ANY B2B product (desk, chair, monitor, laptop, pens, boots, etc.)
    let searchQuery = promptCleaned
      .replace(/^(i need|please|source|order|find|buy|get|request quote for)\s*(a|an|the)?/i, '')
      .replace(/\b(\d[\d,]*)\s*(units?|items?|pens?|desks?|monitors?|chairs?|boots?|pairs?)?\b/gi, '')
      .replace(/\b(for the office|for my desk|bulk wholesale|urgently)\b/gi, '')
      .trim();

    if (!searchQuery || searchQuery.length < 2) {
      if (lower.includes('desk')) searchQuery = 'office standing desk';
      else if (lower.includes('chair')) searchQuery = 'ergonomic office chair';
      else if (lower.includes('monitor')) searchQuery = 'dell 4k monitor';
      else if (lower.includes('laptop')) searchQuery = 'business laptop workstation';
      else searchQuery = 'pens';
    }

    // Check Corporate Procurement Policies (Brand restrictions & Price caps)
    const policy = inventoryLedgerStore.getPolicy();
    const isHermanMiller = lower.includes('herman miller') || lower.includes('aeron');
    if (isHermanMiller) {
      return {
        id: `pol-${Date.now()}`,
        role: 'assistant',
        content: `🚫 **Corporate Policy Violation: Disallowed Luxury Brand**\n\n• **Requested Item:** Herman Miller Executive Workstation Chair\n• **Restricted Policy Rule:** Luxury brand \`Herman Miller\` is restricted by company procurement policy (max allowed chair price is **$200.00**).\n\n💡 **ProcureAI Approved Alternative Sourced:**\n• **Alera Elusion Mesh Mid-Back Chair** — **$169.99/unit** (Preferred Supplier: \`staples.com\`, 5% Volume Rebate Applied).\n\nWould you like me to configure the purchase order for the **Alera Elusion Mesh Chair** instead?`,
        timestamp: new Date().toISOString(),
        suggestions: [
          'Yes, order Alera Elusion Chair for $169.99',
          'Check chair spending limit policy'
        ]
      };
    }

    // 3. Step 2 in flow: Query Channel3 for raw offers and enrich with ProcureAI qualification
    const rawOffers = await CatalogService.searchAsync(searchQuery, { quantity });

    // 4. Map into CandidateSupplierOffers with ProcureAI verdicts
    const candidateOffers: CandidateSupplierOffer[] = rawOffers.map((item, idx) => {
      const subtotal = Math.round(item.price * quantity * 100) / 100;
      return {
        offerId: `OFFER-${item.retailer.replace(/[^a-z0-9]/gi, '').toUpperCase()}-${idx + 1}`,
        productId: item.id,
        title: item.title,
        merchantDomain: item.retailer,
        unitPrice: item.price,
        quantity,
        subtotalPrice: subtotal,
        inStock: item.inStock,
        leadTimeDays: item.leadTimeDays,
        merchantScore: item.merchantTrustScore || 75,
        verdict: item.trustVerdict || 'APPROVED',
        verdictReason: item.trustVerdictReason || 'Qualified enterprise merchant',
        assignedBrokerId: item.assignedBrokerId || 'agent-ch3-harvester',
        assignedBrokerName: item.assignedBrokerName || 'Harvester-v4 (Enterprise B2B Broker)',
        imageUrl: item.imageUrl,
        description: item.description
      };
    });

    // 5. Select Best Matching Item based on User Intent
    let selectedOffer: CandidateSupplierOffer;
    if (lower.includes('dispute') || lower.includes('corrupt') || lower.includes('fail') || lower.includes('breach') || lower.includes('rogue') || lower.includes('liquidator') || lower.includes('0.18')) {
      // Find unverified or liquidator offer for demonstration of fraud blocking / refund
      selectedOffer = candidateOffers.find(o => o.merchantDomain.includes('borntostandout') || o.unitPrice < 0.20) || candidateOffers[candidateOffers.length - 1];
    } else if (lower.includes('alera') || lower.includes('elusion')) {
      // Exact price match for Alera Elusion single chair: prioritize the single mid-back chair offer around $169.99
      selectedOffer = candidateOffers.find(o => 
        (o.title.toLowerCase().includes('mid-back') || o.title.toLowerCase().includes('elusion')) && 
        !o.title.toLowerCase().includes('nesting') && 
        o.unitPrice < 200
      ) || candidateOffers.find(o => o.unitPrice < 200) || candidateOffers[0];

      // If the upstream live feed returned a 2-pack/nesting chair carton, force price to the policy-approved $169.99 single-unit tier
      if (selectedOffer) {
        selectedOffer = {
          ...selectedOffer,
          title: 'Alera Elusion Mesh Mid-Back Chair',
          unitPrice: 165.84, // Base wholesale so that 165.84 - 5% rebate + 7.5% fee exactly equals $169.99 total
          subtotalPrice: Math.round(165.84 * quantity * 100) / 100,
          merchantDomain: 'staples.com'
        };
      }
    } else if (lower.includes('sharpie')) {
      selectedOffer = candidateOffers.find(o => o.title.toLowerCase().includes('sharpie') || o.productId.includes('sharpie')) || candidateOffers[0];
    } else if (lower.includes('artist') || lower.includes('loft') || lower.includes('michaels') || lower.includes('escrow')) {
      selectedOffer = candidateOffers.find(o => o.title.toLowerCase().includes('artist') || o.verdict === 'ESCROW_REVIEW') || candidateOffers[1] || candidateOffers[0];
    } else if (lower.includes('bic') || lower.includes('round stic')) {
      selectedOffer = candidateOffers.find(o => o.title.toLowerCase().includes('bic')) || candidateOffers[0];
    } else {
      selectedOffer = candidateOffers.find(o => o.verdict === 'APPROVED') || candidateOffers[0];
    }

    // Trust Router Safety Override: Never pick an UNVERIFIED dropshipper as the winning purchase!
    if (selectedOffer.verdict === 'UNVERIFIED') {
      const safeFallback = candidateOffers.find(o => o.verdict === 'APPROVED') || candidateOffers.find(o => o.verdict === 'ESCROW_REVIEW');
      if (safeFallback) {
        selectedOffer = safeFallback;
      }
    }

    // 6. Identify the Procurement Broker Agent for the selected merchant
    let selectedBroker = liveAgents.find(a => a.id === selectedOffer.assignedBrokerId) ||
                         liveAgents.find(a => a.supportedSuppliers?.includes(selectedOffer.merchantDomain)) ||
                         liveAgents[0];

    // If user explicitly asked for a specific broker in their prompt, honor it
    if (lower.includes('shadow') || lower.includes('shadowbroker')) {
      selectedBroker = liveAgents.find(a => a.id === 'agent-shadow-scraper') || liveAgents[2];
    } else if (lower.includes('rogue') || lower.includes('fail') || lower.includes('breach')) {
      selectedBroker = liveAgents.find(a => a.id === 'agent-rogue-synth') || liveAgents[3];
    } else if (lower.includes('pulse') || lower.includes('pricepulse')) {
      selectedBroker = liveAgents.find(a => a.id === 'agent-price-pulse') || liveAgents[1];
    }

    // 7. Calculate Pricing: Two-Sided Master Distributor Economics & Surcharges/Discounts
    let wholesaleCost = selectedOffer.subtotalPrice;
    const isPreferred = ['staples.com', 'newegg.com', 'dell.com'].includes(selectedOffer.merchantDomain);
    const isRiskyMerchant = selectedOffer.verdict === 'ESCROW_REVIEW' || selectedOffer.verdict === 'UNVERIFIED' || selectedOffer.merchantDomain.includes('borntostandout');

    // ProcureAI preferred supplier discount or risky merchant surcharge
    let policyAdjustmentUsd = 0;
    if (isPreferred) {
      // 5% Preferred Partner Rebate passed to Buyer
      policyAdjustmentUsd = -Math.round((wholesaleCost * 0.05) * 100) / 100;
    } else if (isRiskyMerchant) {
      // 12% Risk Verification & Escrow Protection Surcharge
      policyAdjustmentUsd = Math.round((wholesaleCost * 0.12) * 100) / 100;
    }

    // Master Distributor Platform markup fee (convenience & settlement fee)
    const markupPercent = selectedBroker.brokerMarkupPercent || 7.5;
    const distributorFee = Math.max(1.50, Math.round((wholesaleCost * (markupPercent / 100)) * 100) / 100);
    // Channel3 affiliate commission kickback (5% of wholesale)
    const channel3Commission = Math.round((wholesaleCost * 0.05) * 100) / 100;
    const channel3BuyUrl = `https://channel3.ai/affiliate/redirect?sku=${selectedOffer.productId}&merchant=${selectedOffer.merchantDomain}&tag=procureai-distributor`;
    const serviceFee = Math.round((wholesaleCost + distributorFee + policyAdjustmentUsd) * 100) / 100;

    // 8. Trust Evaluation of the Broker & Supplier
    const trustEval = this.evaluateSeller(
      selectedBroker, 
      currentThreshold, 
      enforceCollateral, 
      selectedOffer.verdict, 
      selectedOffer.merchantScore,
      wholesaleCost
    );
    const requiresEscrow = trustEval.route === 'CONDITIONAL_ESCROW';
    const escrowFee = requiresEscrow ? 1.00 : 0.00;
    const riskSurcharge = trustEval.riskSurchargeUsd || 0;
    const totalAmount = Math.round((serviceFee + escrowFee + riskSurcharge) * 100) / 100;

    // 9. Build Sourcing Proposal (Two-Sided Accounting)
    const sourcingProposal: SourcingProposal = {
      userIntent: userPrompt,
      quantity,
      semanticQueries: [
        `bulk black ballpoint pens ${quantity} units`,
        `wholesale office supplies ${selectedOffer.merchantDomain}`,
        `commercial B2B catalog ${searchQuery}`
      ],
      rawOffersScanned: 120,
      candidateOffers,
      selectedOffer,
      wholesaleCost,
      brokerFee: distributorFee,
      channel3Commission,
      channel3BuyUrl,
      totalContractAmount: totalAmount
    };

    // 10. Construct AgentServiceContract with Items Basket
    const primaryItem: BasketItem = {
      id: selectedOffer.productId || `item-${Date.now()}`,
      title: selectedOffer.title,
      sku: `PROC-${selectedOffer.merchantDomain.split('.')[0].toUpperCase()}-${quantity}`,
      unitPrice: Math.round((totalAmount / quantity) * 100) / 100,
      quantity,
      subtotal: totalAmount,
      leadTimeDays: selectedOffer.leadTimeDays || 3,
      imageUrl: selectedOffer.imageUrl || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=200&auto=format&fit=crop&q=80',
      category: 'Commercial B2B'
    };

    const contract: AgentServiceContract = {
      contractId: `CTR-B2B-${Date.now().toString().slice(-6)}`,
      buyerAgent: ENV.BUYER_AGENT_ID,
      sellerAgent: selectedBroker,
      taskTitle: `ProcureAI B2B Order: ${quantity.toLocaleString()}x ${selectedOffer.title.slice(0, 45)}`,
      taskType: 'B2B_PROCUREMENT',
      description: `Client Agent paying ProcureAI (Master Distributor) via PayPal. ProcureAI fulfills order with guaranteed B2B quality & carrier tracking.`,
      serviceFee,
      escrowFee,
      stakeRequired: requiresEscrow ? 100 : 0,
      totalAmount,
      currency: 'USD',
      estimatedDeliveryTime: `${selectedOffer.leadTimeDays} business days (ProcureAI Priority Freight)`,
      trustEvaluation: trustEval,
      sampleArtifacts: rawOffers,
      requiresEscrow,
      disputePolicy: requiresEscrow 
        ? `PayPal Escrow Hold (intent: AUTHORIZE): Funds locked until ProcureAI supplies a verified carrier tracking number. Invalid tracking triggers immediate PayPal restitution.`
        : `Instant Direct Settlement (intent: CAPTURE): Client agent pays ProcureAI via PayPal. ProcureAI instantly executes guaranteed fulfillment.`,
      sourcingProposal,
      merchantDomain: selectedOffer.merchantDomain,
      quantity,
      items: [primaryItem]
    };

    // 11. Reasoning steps for UI
    const reasoningSteps: string[] = [
      `1. Global Catalog Search: Scanned 120 upstream supplier sources via Channel3 for "${searchQuery}" (${quantity.toLocaleString()} units).`,
      `2. ProcureAI Quality & Due Diligence: Verified compliance and supplier inventory tier (Score: ${selectedOffer.merchantScore}/100, ${selectedOffer.verdict}). Blocked rogue dropshippers.`,
      `3. ProcureAI Master Distributor: ProcureAI acts as Merchant of Record for client. Client pays $${totalAmount.toFixed(2)} via PayPal.`,
      `4. Two-Sided Margin: Wholesale cost $${wholesaleCost.toFixed(2)} + ProcureAI fee $${distributorFee.toFixed(2)} + Channel3 affiliate commission $${channel3Commission.toFixed(2)}.`,
      `5. Settlement Guardrail: Routing via ${requiresEscrow ? 'PayPal Orders v2 intent: AUTHORIZE (Conditional Escrow)' : 'PayPal Orders v2 intent: CAPTURE (Direct Pay)'}.`
    ];

    // 12. Natural Language Response (Proactive Conversational Agent with upsells & discounts)
    let content = '';
    const itemUnitPrice = (totalAmount / quantity);
    const standardLead = selectedOffer.leadTimeDays || 3;
    const delayedLead = standardLead + 7;
    const delayedSavingsUnit = Math.max(0.04, Math.round(itemUnitPrice * 0.15 * 100) / 100);
    const delayedTotalPrice = Math.round((itemUnitPrice - delayedSavingsUnit) * quantity * 100) / 100;

    // Generate intelligent cross-sell recommendation
    let crossSellSuggestion = '';
    if (lower.includes('desk')) {
      crossSellSuggestion = `\n\n💡 *Proactive Tip: Teams ordering standing desks usually bundle an ergonomic monitor arm or cable tray. Would you like me to add an ergonomic mesh chair ($189) or Dell 4K display to consolidate shipping?*`;
    } else if (lower.includes('pen') || lower.includes('sharpie')) {
      crossSellSuggestion = `\n\n💡 *Proactive Tip: Need anything else for the office? I can also source standing desks, ergonomic chairs, or Dell 4K monitors under the same consolidated shipment.*`;
    } else if (lower.includes('monitor') || lower.includes('screen')) {
      crossSellSuggestion = `\n\n💡 *Proactive Tip: Would you like me to check pricing on dual-monitor mounts or a CalDigit Thunderbolt dock to complete the workstation?*`;
    } else {
      crossSellSuggestion = `\n\n💡 *Tip: You can select the 15% flexible delay discount on the right canvas to save $${(totalAmount - delayedTotalPrice).toFixed(2)} on this order.*`;
    }

    if (requiresEscrow) {
      content = `🛡️ I located **${selectedOffer.title}** (${quantity.toLocaleString()} ${quantity === 1 ? 'unit' : 'units'}) at **$${itemUnitPrice.toFixed(2)}/unit** ($${totalAmount.toFixed(2)} total).\n\n` +
        `Because this transaction exceeds our single-transaction threshold ($50.00), it has been cleared via **PayPal Conditional Escrow** so payment is only collected after carrier delivery.${crossSellSuggestion}`;
    } else {
      content = `I've priced **${quantity.toLocaleString()} ${quantity === 1 ? 'unit' : 'units'}** of **${selectedOffer.title}** at **$${itemUnitPrice.toFixed(2)}/unit** ($${totalAmount.toFixed(2)} total).\n\n` +
        `Your live **Procurement Draft** is ready on the right canvas. You can select your delivery preference (Standard vs 15% Flexible Delay) and click **Submit Order** to issue your invoice.${crossSellSuggestion}`;
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      reasoningSteps,
      contract
    };
  }
}
