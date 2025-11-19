// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';
import { openai, isOpenAIConfigured } from '@/lib/openai/client';

const TOPICS_PROMPT = `
You are a content strategist creating article topics based on user notes and mentor philosophy.

Generate 5 article topics. Each topic must include:
- title: Attractive article title
- angle: Why write this (the unique perspective)
- connection_to_notes: How it connects to the main content
- connection_to_mentor: How it connects to the mentor's philosophy
- platform: Suitable platform (FB / IG / Blog)

Output JSON ONLY:
{
  "topics": [
    {
      "title": string,
      "angle": string,
      "connection_to_notes": string,
      "connection_to_mentor": string,
      "platform": "FB" | "IG" | "Blog"
    },
    ... (5 topics total)
  ]
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
    const { noteIds, mentorStyle, extraction } = body;

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length < 2) {
      return NextResponse.json({ error: 'At least 2 note IDs are required' }, { status: 400 });
    }
    if (!mentorStyle) {
      return NextResponse.json({ error: 'Mentor style is required' }, { status: 400 });
    }
    if (!extraction) {
      return NextResponse.json({ error: 'Extraction data is required' }, { status: 400 });
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

Generate 5 article topics following the JSON format specified.
`.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: TOPICS_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_completion_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}$/);
      parsed = match ? JSON.parse(match[0]) : { topics: [] };
    }

    // Ensure we have exactly 5 topics
    if (!parsed.topics || !Array.isArray(parsed.topics)) {
      parsed.topics = [];
    }
    if (parsed.topics.length < 5) {
      // Fill with placeholder topics if needed
      while (parsed.topics.length < 5) {
        parsed.topics.push({
          title: `Topic ${parsed.topics.length + 1}`,
          angle: 'To be generated',
          connection_to_notes: 'Connects to selected notes',
          connection_to_mentor: 'Connects to mentor philosophy',
          platform: 'Blog',
        });
      }
    }

    return NextResponse.json({ topics: parsed.topics.slice(0, 5) });
  } catch (error: any) {
    console.error('POST /api/article/topics error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

