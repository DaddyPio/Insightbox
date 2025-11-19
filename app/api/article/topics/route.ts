// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';
import { openai, isOpenAIConfigured } from '@/lib/openai/client';

const TOPICS_PROMPT = `
You are a content strategist creating article topics based on user notes and mentor philosophy.

CRITICAL: You MUST generate exactly 5 unique, creative article topics. Each topic must be different and compelling.

Each topic must include:
- title: Attractive, specific article title (NOT generic like "Topic 1")
- angle: Why write this (the unique perspective, what makes it interesting)
- connection_to_notes: How it connects to the main content from notes
- connection_to_mentor: How it connects to the mentor's philosophy
- platform: Suitable platform (FB / IG / Blog)

Output JSON ONLY (no other text):
{
  "topics": [
    {
      "title": "具體的標題，不是 Topic 1",
      "angle": "為什麼要寫這個主題的獨特觀點",
      "connection_to_notes": "如何與筆記內容連接",
      "connection_to_mentor": "如何與導師哲學連接",
      "platform": "FB"
    },
    {
      "title": "另一個具體的標題",
      "angle": "另一個獨特觀點",
      "connection_to_notes": "連接說明",
      "connection_to_mentor": "連接說明",
      "platform": "IG"
    },
    ... (exactly 5 topics, all with unique titles)
  ]
}

Language must match the input notes (zh-TW, en, or ja).
DO NOT use placeholder text like "Topic 1", "To be generated", etc. All fields must be real, specific content.
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

    // Validate extraction data
    if (!extraction || typeof extraction !== 'object') {
      return NextResponse.json(
        { error: 'Invalid extraction data', details: 'Extraction must be a valid object' },
        { status: 400 }
      );
    }

    const userPrompt = `
Mentor Style: ${mentorStyle}

Selected Notes:
${notesText}

Content Extraction (use this to understand themes and insights):
${JSON.stringify(extraction, null, 2)}

Based on the notes and extraction above, generate exactly 5 unique, creative article topics.
Each topic must have a specific, attractive title (NOT generic like "Topic 1").
Make sure the topics are relevant to the notes and mentor philosophy.

Generate 5 article topics following the JSON format specified.
`.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: TOPICS_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_completion_tokens: 1200, // Increased for 5 topics
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    console.log('Raw topics response:', raw);
    
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Try to extract JSON block
      const match = raw.match(/\{[\s\S]*\}$/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = { topics: [] };
        }
      } else {
        parsed = { topics: [] };
      }
    }

    console.log('Parsed topics:', JSON.stringify(parsed, null, 2));

    // Validate and ensure we have exactly 5 topics
    if (!parsed.topics || !Array.isArray(parsed.topics)) {
      console.error('Invalid topics format:', parsed);
      return NextResponse.json(
        { error: 'Failed to generate topics', details: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    // Filter out invalid topics and ensure we have valid ones
    const validTopics = parsed.topics
      .filter((t: any) => t && t.title && t.title !== 'Topic 1' && t.title !== 'To be generated')
      .slice(0, 5);

    if (validTopics.length < 5) {
      console.error('Not enough valid topics generated:', validTopics.length);
      return NextResponse.json(
        { error: 'Failed to generate enough topics', details: `Only generated ${validTopics.length} valid topics` },
        { status: 500 }
      );
    }

    return NextResponse.json({ topics: validTopics });
  } catch (error: any) {
    console.error('POST /api/article/topics error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

