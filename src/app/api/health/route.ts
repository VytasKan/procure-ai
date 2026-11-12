import { NextResponse } from 'next/server';
import { ENV, hasPayPalCredentials, hasAiCredentials } from '@/backend/config/env';
import { PayPalService } from '@/backend/services/paypal-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  let liveSandboxPing: { ok: boolean; latencyMs?: number; error?: string } = { ok: false };

  if (hasPayPalCredentials()) {
    const start = Date.now();
    try {
      await PayPalService.getAccessToken();
      liveSandboxPing = {
        ok: true,
        latencyMs: Date.now() - start
      };
    } catch (err) {
      liveSandboxPing = {
        ok: false,
        error: err instanceof Error ? err.message : 'Auth failed'
      };
    }
  }

  return NextResponse.json({
    status: liveSandboxPing.ok ? 'healthy' : 'simulated',
    timestamp: new Date().toISOString(),
    environment: ENV.PAYPAL_ENVIRONMENT,
    hasPayPalCredentials: hasPayPalCredentials(),
    hasAiCredentials: hasAiCredentials(),
    minTrustScoreThreshold: ENV.MIN_TRUST_SCORE_THRESHOLD,
    buyerAgentId: ENV.BUYER_AGENT_ID,
    sandboxPing: liveSandboxPing,
    clientIdMasked: ENV.PAYPAL_CLIENT_ID ? `${ENV.PAYPAL_CLIENT_ID.slice(0, 8)}...${ENV.PAYPAL_CLIENT_ID.slice(-6)}` : 'Not configured'
  });
}
