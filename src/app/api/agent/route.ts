import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/backend/services/agent-orchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, history } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await AgentOrchestrator.processMessage(prompt);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Agent route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal agent execution error' },
      { status: 500 }
    );
  }
}
