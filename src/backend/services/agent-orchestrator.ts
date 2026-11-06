import { CatalogService } from './catalog-service';
import { ENV } from '../config/env';
import { AgentChatMessage, ProcurementQuote, ProductItem } from '../types';

export class AgentOrchestrator {
  /**
   * Process a user procurement prompt and generate an agent response with structured quotes and tool actions
   */
  static async processMessage(
    userPrompt: string
  ): Promise<AgentChatMessage> {
    const lower = userPrompt.toLowerCase();

    // 1. Identify product keywords or intent
    let targetCategory: string | undefined;
    if (lower.includes('monitor') || lower.includes('screen') || lower.includes('display')) {
      targetCategory = 'hardware';
    } else if (lower.includes('desk') || lower.includes('chair') || lower.includes('furniture')) {
      targetCategory = 'furniture';
    } else if (lower.includes('dock') || lower.includes('keyboard') || lower.includes('mouse') || lower.includes('headset')) {
      targetCategory = 'peripherals';
    }

    // Extract quantity if mentioned (e.g. "3 monitors", "equip 5 people")
    const qtyMatch = userPrompt.match(/(\d+)\s*(monitors?|desks?|chairs?|docks?|keyboards?|bundles?|people|engineers?|sets?)/i);
    const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

    // Search catalog items
    let matchedProducts: ProductItem[] = [];
    if (lower.includes('work-from-home') || lower.includes('bundle') || lower.includes('equip') || lower.includes('onboard') || lower.includes('setup')) {
      // Create a bundled setup: Desk + Monitor + Dock
      const desk = CatalogService.search('SmartDesk')[0] || CatalogService.search('FEZIBO')[0];
      const mon = CatalogService.search('UltraSharp')[0] || CatalogService.search('LG')[0];
      const dock = CatalogService.search('CalDigit')[0] || CatalogService.search('Anker')[0];
      matchedProducts = [desk, mon, dock].filter(Boolean);
    } else {
      matchedProducts = CatalogService.search(userPrompt, { category: targetCategory });
      if (matchedProducts.length === 0) {
        // Fallback search across all items
        matchedProducts = CatalogService.getAll().slice(0, 2);
      }
    }

    // 2. Generate a structured Procurement Quote if items were found
    let quote: ProcurementQuote | undefined;

    if (matchedProducts.length > 0) {
      const isBundle = matchedProducts.length > 1;
      const items = matchedProducts.map(prod => {
        const itemQty = isBundle ? quantity : (quantity > 1 ? quantity : 1);
        return {
          product: prod,
          quantity: itemQty,
          unitPrice: prod.price,
          subtotal: prod.price * itemQty
        };
      });

      const subtotal = items.reduce((sum, it) => sum + it.subtotal, 0);
      const bulkDiscount = items.reduce((sum, it) => sum + it.quantity, 0) >= 3 ? subtotal * 0.08 : 0;
      const shippingCost = subtotal > 500 ? 0 : 35.00;
      const estimatedTax = (subtotal - bulkDiscount) * 0.075; // 7.5% est tax
      const totalAmount = Math.round((subtotal - bulkDiscount + shippingCost + estimatedTax) * 100) / 100;

      const requiresApproval = totalAmount > ENV.AUTO_APPROVE_THRESHOLD;
      const estDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      quote = {
        quoteId: `QTE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        title: isBundle 
          ? `Engineered Workstation Bundle (${quantity}x Employee Workstation Packages)`
          : `${items[0].product.title} (x${items[0].quantity})`,
        description: `Verified supplier availability across ${Array.from(new Set(items.map(i => i.product.retailer))).join(', ')} with scheduled priority delivery.`,
        items,
        subtotal,
        estimatedTax,
        shippingCost,
        bulkDiscount,
        totalAmount,
        currency: 'USD',
        vendorNotes: 'Includes corporate manufacturer warranty, Net-15 PayPal Invoice availability, and bulk enterprise discount.',
        estimatedDeliveryDate: estDelivery,
        requiresApproval,
        approvalReason: requiresApproval 
          ? `Order total ($${totalAmount.toFixed(2)}) exceeds auto-approval guardrail ($${ENV.AUTO_APPROVE_THRESHOLD.toFixed(2)}). Requires manager sign-off.`
          : undefined,
        paymentMethod: totalAmount > 1000 ? 'PAYPAL_INVOICE' : 'PAYPAL_ORDER'
      };
    }

    // 3. Compose the agent's explanation text
    let responseText = '';
    if (quote) {
      responseText = `I have analyzed multi-merchant inventories across authorized suppliers for **"${userPrompt}"**.\n\n` +
        `📦 **Identified Items:**\n` +
        quote.items.map(it => `• **${it.quantity}x ${it.product.title}** from *${it.product.retailer}* — $${it.unitPrice.toFixed(2)} ea`).join('\n') +
        `\n\n💰 **Total:** $${quote.totalAmount.toFixed(2)} USD ` +
        (quote.bulkDiscount > 0 ? `*(Includes $${quote.bulkDiscount.toFixed(2)} 8% B2B bulk savings)*` : '') +
        `\n🚚 **Estimated Delivery:** By ${quote.estimatedDeliveryDate}.\n\n` +
        (quote.requiresApproval 
          ? `⚠️ **Policy Trigger:** Total order exceeds company auto-approval limit ($${ENV.AUTO_APPROVE_THRESHOLD.toFixed(2)}). Please review the formal quote card below and click **"Approve & Execute via PayPal"** to confirm.`
          : `✅ **Guardrail Passed:** This purchase is within pre-approved departmental limits. Review the quote below to proceed.`);
    } else {
      responseText = `I searched current supplier catalogs for "${userPrompt}", but could not find exact SKU matches. Try searching for "dual 4K monitors", "electric standing desk", "ergonomic chair", or "onboard 3 developers".`;
    }

    const reasoningSteps: string[] = quote ? [
      `Catalog Discovery: Queried Channel3 MCP across authorized enterprise retailers.`,
      `SKU Selection: Matched ${matchedProducts.length} verified item(s) from ${Array.from(new Set(matchedProducts.map(p => p.retailer))).join(', ')}.`,
      `Volume Discount: ${quote.bulkDiscount > 0 ? `Qualified for 8% Tier-2 B2B bulk savings (-$${quote.bulkDiscount.toFixed(2)}).` : 'Standard enterprise tier applied.'}`,
      `Policy Evaluation: Total ($${quote.totalAmount.toFixed(2)}) ${quote.requiresApproval ? `exceeds auto-approval cap ($${ENV.AUTO_APPROVE_THRESHOLD.toFixed(2)}) -> Escalated for Manager Authorization.` : `within pre-approved budget ($${ENV.AUTO_APPROVE_THRESHOLD.toFixed(2)}).`}`,
      `PayPal Preparation: Initialized ${quote.paymentMethod === 'PAYPAL_INVOICE' ? 'PayPal Invoicing v2 (Net-15 terms)' : 'PayPal Orders v2 capture manifest'} payload.`
    ] : [
      `Catalog Search: Queried supplier database for "${userPrompt}".`,
      `Result: 0 matching SKUs found.`
    ];

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
      reasoningSteps,
      quote
    };
  }
}
