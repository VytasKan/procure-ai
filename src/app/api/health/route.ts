import { NextResponse } from 'next/server';
import { ENV, hasPayPalCredentials, hasAiCredentials } from '@/backend/config/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: ENV.PAYPAL_ENVIRONMENT,
    hasPayPalCredentials: hasPayPalCredentials(),
    hasAiCredentials: hasAiCredentials(),
    autoApproveThreshold: ENV.AUTO_APPROVE_THRESHOLD,
    company: ENV.COMPANY_NAME
  });
}
