import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/backend/services/agent-orchestrator';
import { Channel3 } from '@channel3/sdk';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, conversation_id, threshold, enforceCollateral } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.CHANNEL3_API_KEY;
    const lower = prompt.toLowerCase();

    // Check Corporate Procurement Policies (Disallowed brands & price caps)
    if (lower.includes('herman miller') || lower.includes('steelcase gesture') || lower.includes('aeron')) {
      return NextResponse.json({
        id: `pol-${Date.now()}`,
        role: 'assistant',
        content: `🚫 **Corporate Policy Violation: Disallowed Luxury Brand**\n\n• **Requested Item:** Herman Miller Executive Workstation Chair\n• **Restricted Policy Rule:** Luxury brand \`Herman Miller\` is restricted by corporate procurement policy (max allowable chair spend is **$200.00**).\n\n💡 **ProcureAI Approved Alternative Sourced:**\n• **Alera Elusion Mesh Mid-Back Chair** — **$169.99/unit** (Preferred Supplier: \`staples.com\`, 5% Partner Rebate Applied).\n\nWould you like me to configure the purchase order for the **Alera Elusion Mesh Chair ($169.99)** instead?`,
        timestamp: new Date().toISOString(),
        suggestions: [
          'Yes, order Alera Elusion Chair for $169.99',
          'Review corporate chair spending limits'
        ]
      });
    }

    // Check if this is an explicit purchase order command (e.g. "Purchase 1x ...", "Buy ...", "Order ...")
    const isPurchaseOrder = lower.startsWith('purchase ') || lower.startsWith('buy ') || lower.startsWith('order ') || lower.includes('purchase 1x') || lower.includes('configure order');

    // Check if this is an explicit wholesale demo beat (pens / office bulk scenario)
    const isWholesaleDemo = isPurchaseOrder || lower.includes('sharpie') || lower.includes('bic') || lower.includes('100 pen') || lower.includes('dispute') || lower.includes('rogue') || lower.includes('alera') || lower.includes('replenish');

    // Handle batch auto-replenish of all deficit inventory items
    if (lower.includes('replenish all') || lower.includes('auto-replenish all')) {
      const lowItems = [
        {
          id: 'inv-bic-pens',
          sku: 'OFF-BIC-08',
          title: 'BIC Round Stic Grip Extra Life Ballpoint Pens (Box of 144)',
          quantity: 50,
          unitPrice: 0.30,
          subtotal: 15.00,
          leadTimeDays: 3,
          imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'inv-sgel-pens',
          sku: 'OFF-SGEL-07',
          title: 'Sharpie S-Gel Gel Pens Medium 0.7mm No-Smear Black (Pack of 36)',
          quantity: 30,
          unitPrice: 0.35,
          subtotal: 10.50,
          leadTimeDays: 2,
          imageUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'inv-office-chair',
          sku: 'FURN-ALERA-MESH',
          title: 'Alera Elusion Series Mesh Mid-Back Swivel Chair (Black)',
          quantity: 4,
          unitPrice: 169.99,
          subtotal: 679.96,
          leadTimeDays: 3,
          imageUrl: 'https://images.unsplash.com/photo-1580481077195-731da89f3077?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'inv-standing-desk',
          sku: 'FURN-DESK-W48',
          title: 'Dual-Motor Sit-to-Stand Workstation Desk 48x30 Walnut',
          quantity: 3,
          unitPrice: 389.00,
          subtotal: 1167.00,
          leadTimeDays: 4,
          imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'inv-dell-4k',
          sku: 'IT-DELL-U27',
          title: 'Dell 27" 4K UHD UltraSharp USB-C Hub IPS Monitor (U2723QE)',
          quantity: 5,
          unitPrice: 349.00,
          subtotal: 1745.00,
          leadTimeDays: 2,
          imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&auto=format&fit=crop&q=80'
        }
      ];

      const totalAmount = Math.round(lowItems.reduce((acc, it) => acc + it.subtotal, 0) * 100) / 100;

      const contract = {
        contractId: `CTR-B2B-${Date.now().toString().slice(-6)}`,
        buyerAgent: 'agent://treasury-prime.eth',
        sellerAgent: {
          id: 'agent-ch3-harvester',
          name: 'ProcureAI Master Distributor',
          handle: '@procureai-distributor',
          trustScore: 96,
          stakeCollateralUsd: 2500,
          disputeRatePercent: 0.1,
          totalSettledUsd: 540000,
          completedOrdersCount: 1420,
          supportedSuppliers: ['staples.com', 'newegg.com', 'dell.com'],
          isAllowlisted: true
        },
        taskTitle: `ProcureAI Consolidated Replenishment: ${lowItems.length} line items`,
        taskType: 'B2B_PROCUREMENT',
        description: `Consolidated replenishment package for ${lowItems.length} office & IT inventory deficit items.`,
        serviceFee: totalAmount,
        escrowFee: 0,
        stakeRequired: 0,
        totalAmount: totalAmount,
        currency: 'USD',
        estimatedDeliveryTime: '2-4 business days (Consolidated Freight)',
        trustEvaluation: {
          score: 96,
          threshold: threshold || 75,
          route: 'INSTANT_DIRECT',
          riskFlags: [],
          collateralRatio: 16.6,
          recommendation: 'Verified ProcureAI preferred enterprise suppliers. 5% partner volume rebate applied.',
          merchantScore: 96,
          merchantVerdict: 'APPROVED'
        },
        sampleArtifacts: [],
        requiresEscrow: false,
        disputePolicy: 'Guaranteed B2B delivery backed by PayPal enterprise buyer protection.',
        items: lowItems
      };

      return NextResponse.json({
        id: `replenish-${Date.now()}`,
        role: 'assistant',
        content: `📦 **Autonomous Inventory Replenishment Package Prepared!**\n\nI have scanned the **Office Inventory Ledger** and consolidated **${lowItems.length} deficit items** across our preferred enterprise suppliers (Staples, Newegg, Dell):\n\n• **50x** BIC Round Stic Pens (Box 144) — $15.00\n• **30x** Sharpie S-Gel 0.7mm Black (Pack 36) — $10.50\n• **4x** Alera Elusion Ergonomic Mesh Chairs — $679.96\n• **3x** Dual-Motor Sit-to-Stand Workstation Desks — $1,167.00\n• **5x** Dell UltraSharp 27" 4K USB-C Hub Monitors — $1,745.00\n\n💰 **Consolidated Order Total:** **$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD** *(Includes 5% preferred partner rebate)*.\n\nYour **Live Order Canvas** is ready on the right. You can select **Standard Priority** vs **15% Flexible Delay** and click **Submit Order** to execute payment via PayPal.`,
        timestamp: new Date().toISOString(),
        contract
      });
    }

    // If Channel3 API key is configured and this is natural product search / refinement, use Channel3 conversational turn
    if (apiKey && !isWholesaleDemo) {
      try {
        const client = new Channel3({ apiKey });
        const turn = await client.conversations.createTurn({
          message: {
            role: 'user',
            parts: [{ type: 'text', text: prompt }]
          },
          conversation_id: conversation_id || undefined
        });

        const activeConversationId = turn.conversation_id;
        const textParts: string[] = [];
        const discoveredProducts: any[] = [];

        if (Array.isArray(turn.message.parts)) {
          for (const part of turn.message.parts) {
            if (part.type === 'text' && part.text) {
              textParts.push(part.text);
            } else if (part.type === 'tool' && part.output && (part.output as any).products) {
              discoveredProducts.push(...(part.output as any).products);
            }
          }
        }

        const fullText = textParts.join('\n\n') || "I've reviewed the catalog for you.";
        const suggestions = turn.message.suggestions || [];

        let contract: any = undefined;
        if (discoveredProducts.length > 0) {
          const topPick = discoveredProducts[0];
          const offer = topPick.offers?.[0];
          const price = offer?.price?.price || offer?.price?.amount || 99.00;
          const title = topPick.title || 'Discovered Item';
          const img = topPick.images?.find((i: any) => i.is_main_image)?.url || topPick.images?.[0]?.url;

          contract = {
            contractId: `CTR-C3-${Date.now().toString().slice(-6)}`,
            buyerAgent: 'agent://treasury-prime.eth',
            sellerAgent: {
              id: 'agent-ch3-harvester',
              name: 'ProcureAI Enterprise Broker',
              handle: '@procureai-broker',
              trustScore: 92,
              stakeCollateralUsd: 1500,
              disputeRatePercent: 0.1,
              totalSettledUsd: 485000,
              completedOrdersCount: 1240,
              supportedSuppliers: [offer?.domain || 'Channel3 Live Commerce'],
              isAllowlisted: true
            },
            taskTitle: `Channel3 Order: 1x ${title.slice(0, 45)}`,
            taskType: 'B2B_PROCUREMENT',
            description: `Shopper purchasing ${title} sourced directly via Channel3 conversational commerce.`,
            serviceFee: price,
            escrowFee: 0,
            stakeRequired: 0,
            totalAmount: price,
            currency: 'USD',
            estimatedDeliveryTime: '2-3 business days',
            trustEvaluation: {
              score: 92,
              threshold: threshold || 75,
              route: 'INSTANT_PAYPAL',
              riskFlags: [],
              collateralRatio: 10,
              recommendation: 'Verified Channel3 merchant. Safe for direct PayPal settlement.',
              merchantScore: 92,
              merchantVerdict: 'APPROVED'
            },
            sampleArtifacts: [],
            requiresEscrow: false,
            disputePolicy: 'Direct PayPal settlement with full buyer protection guarantee.',
            items: [
              {
                id: topPick.id || `c3-${Date.now()}`,
                title: title,
                sku: `C3-${topPick.id || 'SKU'}`,
                unitPrice: price,
                quantity: 1,
                subtotal: price,
                leadTimeDays: 3,
                imageUrl: img
              }
            ]
          };
        }

        return NextResponse.json({
          id: `c3-turn-${Date.now()}`,
          role: 'assistant',
          content: fullText,
          timestamp: new Date().toISOString(),
          conversation_id: activeConversationId,
          suggestions,
          products: discoveredProducts.map(p => {
            const off = p.offers?.[0];
            return {
              id: p.id,
              title: p.title,
              price: off?.price?.price || off?.price?.amount || 0,
              currency: off?.price?.currency || 'USD',
              brand: p.brands?.[0]?.name,
              retailer: off?.domain,
              imageUrl: p.images?.find((i: any) => i.is_main_image)?.url || p.images?.[0]?.url,
              productUrl: off?.url,
              description: p.description
            };
          }),
          contract
        });
      } catch (c3Err) {
        console.warn('Channel3 conversational turn fallback to orchestrator:', c3Err);
      }
    }

    const response = await AgentOrchestrator.processMessage(
      prompt,
      threshold,
      enforceCollateral !== undefined ? Boolean(enforceCollateral) : true
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error('Agent route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal agent execution error' },
      { status: 500 }
    );
  }
}
