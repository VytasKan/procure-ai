import { NextRequest, NextResponse } from 'next/server';
import { Channel3 } from '@channel3/sdk';
import { AgentOrchestrator } from '@/backend/services/agent-orchestrator';
import { ProductItem } from '@/backend/types';

export async function POST(req: NextRequest) {
  try {
    const { prompt, conversation_id, threshold = 75, enforceCollateral = true } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.CHANNEL3_API_KEY;
    const lower = prompt.toLowerCase();
    const isPurchaseOrder = lower.startsWith('purchase ') || lower.startsWith('buy ') || lower.startsWith('order ') || lower.includes('purchase 1x') || lower.includes('configure order');

    if (!apiKey || isPurchaseOrder) {
      // Fallback to internal orchestrator for purchase orders and when no Channel3 API key
      const fallbackMsg = await AgentOrchestrator.processMessage(prompt, threshold, enforceCollateral);
      return NextResponse.json(fallbackMsg);
    }

    const client = new Channel3({ apiKey });

    // 1. Call Channel3 conversational turn
    const turn = await client.conversations.createTurn({
      message: {
        role: 'user',
        parts: [{ type: 'text', text: prompt }]
      },
      conversation_id: conversation_id || undefined
    });

    const activeConversationId = turn.conversation_id;

    // 2. Extract text parts, tool output products, and suggestions
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

    // 3. If products were discovered, create a live qualified contract for the top pick
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
          threshold,
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

  } catch (error: any) {
    console.error('Channel3 turn error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process conversation turn' },
      { status: 500 }
    );
  }
}
