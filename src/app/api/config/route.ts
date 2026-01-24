import { NextResponse } from 'next/server';

export async function GET() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

  return NextResponse.json({
    configured: hasOpenAI && hasAnthropic,
    openai: hasOpenAI,
    anthropic: hasAnthropic,
  });
}
