// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isOpenAIConfigured } from '@/lib/openai/client';
import { generateChildLetter, type GenerateLetterOptions } from '@/lib/openai/letters';

export const dynamic = 'force-dynamic';

/**
 * POST /api/letters/generate
 * Generate a letter from raw text using AI
 */
export async function POST(request: NextRequest) {
  try {
    const hasAuth = !!request.headers.get('authorization');
    if (!hasAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json({ error: 'OpenAI is not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { rawText, childName, tone, locale } = body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: 'rawText is required and must not be empty' },
        { status: 400 }
      );
    }

    const options: GenerateLetterOptions = {
      rawText: rawText.trim(),
      childName: childName || undefined,
      tone: tone || 'warm',
      locale: locale || 'zh-TW',
    };

    const result = await generateChildLetter(options);

    return NextResponse.json({ letter: result });
  } catch (error: any) {
    console.error('POST /api/letters/generate error:', error);
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to generate letter',
        details: error?.toString(),
      },
      { status: 500 }
    );
  }
}

