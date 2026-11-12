import { NextResponse } from 'next/server';
import { Channel3 } from '@channel3/sdk';

export async function POST() {
  try {
    const apiKey = process.env.CHANNEL3_API_KEY;
    if (!apiKey || apiKey === 'your_channel3_api_key') {
      return NextResponse.json(
        { 
          error: 'CHANNEL3_API_KEY is not configured in .env.local',
          demoMode: true 
        },
        { status: 400 }
      );
    }

    const server = new Channel3({
      apiKey: apiKey,
    });

    const created = await server.conversations.clientTokens.create();
    return NextResponse.json({
      token: created.token,
      expiresAt: created.expires_at,
    });
  } catch (error: any) {
    console.error('Error minting Channel3 client token:', error);
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to mint client token',
        details: error?.body || error?.response || undefined
      },
      { status: 500 }
    );
  }
}
