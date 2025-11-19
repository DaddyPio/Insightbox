// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { openai, isOpenAIConfigured } from '@/lib/openai/client';

export const dynamic = 'force-dynamic';

const CARD_PROMPT = `
You are creating social media card content from an article.

Extract from the article:
1. Title (one sentence version, catchy)
2. Key quote (highlight quote)
3. For reflection style: A deep, thought-provoking sentence
4. For action style: An actionable short sentence

Output JSON ONLY:
{
  "title": string,
  "key_quote": string,
  "reflection_quote": string,  // For reflection style card
  "action_quote": string        // For action style card
}

Language must match the article language (zh-TW, en, or ja).
`.trim();

export async function POST(request: NextRequest) {
  try {
    const hasAuth = !!request.headers.get('authorization');
    if (!hasAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isOpenAIConfigured() || !openai) {
      return NextResponse.json({ error: 'OpenAI is not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { article } = body;

    if (!article || !article.content) {
      return NextResponse.json({ error: 'Article content is required' }, { status: 400 });
    }

    const userPrompt = `
Article:
Title: ${article.title || ''}
Content: ${article.content}

Extract card content following the JSON format specified.
`.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: CARD_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_completion_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}$/);
      parsed = match ? JSON.parse(match[0]) : {
        title: article.title || 'Article',
        key_quote: article.key_quote || '',
        reflection_quote: '',
        action_quote: '',
      };
    }

    return NextResponse.json({ card: parsed });
  } catch (error: any) {
    console.error('POST /api/article/card error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

