// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';
import { openai, isOpenAIConfigured } from '@/lib/openai/client';

const EXTRACTION_PROMPT = `
You are a content strategist analyzing user notes to extract deep insights.

Your task:
1. Analyze the provided notes
2. Extract key points (NOT copying text, but summarizing concepts)
3. Group similar concepts together
4. Identify deep themes (e.g., loss, growth, relationships, persistence)
5. Define reader pain points
6. Determine emotional direction suitable for the audience

Output JSON ONLY:
{
  "key_points": string[],        // 3-5 key concepts extracted (not copied)
  "grouped_concepts": string[],  // Similar concepts grouped together
  "deep_themes": string[],       // 3-5 deep themes identified
  "pain_points": string[],       // Reader pain points
  "emotional_direction": string  // Recommended emotional tone
}

Language must match the input notes (zh-TW, en, or ja).
`.trim();

export async function POST(request: NextRequest) {
  try {
    const hasAuth = !!request.headers.get('authorization');
    if (!hasAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }
    if (!isOpenAIConfigured() || !openai) {
      return NextResponse.json({ error: 'OpenAI is not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { noteIds, mentorStyle } = body;

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length < 2) {
      return NextResponse.json({ error: 'At least 2 note IDs are required' }, { status: 400 });
    }
    if (!mentorStyle) {
      return NextResponse.json({ error: 'Mentor style is required' }, { status: 400 });
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

Notes to analyze:
${notesText}

Extract insights following the JSON format specified.
`.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_completion_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}$/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    return NextResponse.json({ extraction: parsed });
  } catch (error: any) {
    console.error('POST /api/article/extract error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

