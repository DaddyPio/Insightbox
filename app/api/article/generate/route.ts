// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';
import { openai, isOpenAIConfigured } from '@/lib/openai/client';

const ARTICLE_PROMPT = `
You are a professional content writer creating a 500-1000 word article.

CRITICAL RULES:
- DO NOT copy, quote, or reuse exact sentences from the user's notes.
- Use the notes as a skeleton/framework, but write ORIGINAL content.
- Apply the mentor's philosophy as a lens to elevate the content, but DO NOT copy quotes.
- The article must be YOUR OWN CREATION, inspired by notes and mentor philosophy.

Article Structure:
1. Opening (Grab attention)
   - Use emotion, story, or situation
   - Avoid clichés
   
2. Main Body (Your notes content → Core message)
   - Use notes as content skeleton
   - Elevate with mentor's thinking (not copying)
   - Deepen perspectives (mentor philosophy × your life examples)
   - Use metaphors, stories, golden quotes
   - Keep it practical, avoid empty words

3. Conclusion (Call to action / Reflection)
   - Give readers actionable small steps they can take immediately
   - Or a profound, emotional sentence

Output JSON ONLY:
{
  "title": string,
  "content": string,  // 500-1000 words, formatted with paragraphs
  "key_quote": string // A golden quote extracted from the article
}

Language must match the input notes (zh-TW, en, or ja).
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
    const { noteIds, mentorStyle, extraction, selectedTopic } = body;

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length < 2) {
      return NextResponse.json({ error: 'At least 2 note IDs are required' }, { status: 400 });
    }
    if (!mentorStyle) {
      return NextResponse.json({ error: 'Mentor style is required' }, { status: 400 });
    }
    if (!selectedTopic) {
      return NextResponse.json({ error: 'Selected topic is required' }, { status: 400 });
    }

    const supabase = supabaseFromRequest(request);
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize Supabase client' }, { status: 500 });
    }

    // Fetch selected notes
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, title, content, tags')
      .in('id', noteIds);

    if (notesError || !notes || notes.length === 0) {
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }

    const notesText = notes.map((n, i) => {
      const tags = Array.isArray(n.tags) ? n.tags.join(', ') : '';
      return `Note ${i + 1}:\nTitle: ${n.title || '(no title)'}\nContent: ${n.content}\nTags: ${tags}`;
    }).join('\n\n');

    const userPrompt = `
Mentor Style: ${mentorStyle}

Selected Notes:
${notesText}

Content Extraction:
${JSON.stringify(extraction, null, 2)}

Selected Topic:
${JSON.stringify(selectedTopic, null, 2)}

Write a 500-1000 word article following the structure specified. The content must be ORIGINAL - do not copy from notes.
`.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: ARTICLE_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_completion_tokens: 2000, // Increased for longer articles
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}$/);
      parsed = match ? JSON.parse(match[0]) : { title: 'Article', content: raw, key_quote: '' };
    }

    return NextResponse.json({ article: parsed });
  } catch (error: any) {
    console.error('POST /api/article/generate error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

