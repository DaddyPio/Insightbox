// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';
import { openai, isOpenAIConfigured } from '@/lib/openai/client';

export const dynamic = 'force-dynamic';

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
    let notes;
    try {
      const { data, error: notesError } = await supabase
        .from('notes')
        .select('id, title, content, tags')
        .in('id', noteIds);

      if (notesError) {
        console.error('Supabase notes fetch error:', notesError);
        return NextResponse.json(
          { error: 'Failed to fetch notes', details: notesError.message },
          { status: 500 }
        );
      }

      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: 'No notes found', details: 'Selected notes do not exist' },
          { status: 404 }
        );
      }

      notes = data;
    } catch (fetchError: any) {
      console.error('Error fetching notes:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch notes', details: fetchError?.message || 'Unknown error' },
        { status: 500 }
      );
    }

    const notesText = notes.map((n: any, i: number) => {
      const tags = Array.isArray(n.tags) ? n.tags.join(', ') : '';
      const content = n.content || '';
      const title = n.title || '(no title)';
      return `Note ${i + 1}:\nTitle: ${title}\nContent: ${content}\nTags: ${tags}`;
    }).join('\n\n');

    if (!notesText || notesText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid notes data', details: 'Notes content is empty' },
        { status: 400 }
      );
    }

    const userPrompt = `
Mentor Style: ${mentorStyle}

Notes to analyze:
${notesText}

Extract insights following the JSON format specified.
`.trim();

    let completion;
    try {
      console.log('Calling OpenAI API with prompt length:', userPrompt.length);
      completion = await openai.chat.completions.create({
        model: 'gpt-5.1',
        messages: [
          { role: 'system', content: EXTRACTION_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_completion_tokens: 800, // Increased from 500 to allow more content
      });
      console.log('OpenAI API response received:', {
        choices: completion.choices?.length || 0,
        finish_reason: completion.choices?.[0]?.finish_reason,
        has_content: !!completion.choices?.[0]?.message?.content,
      });
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError);
      console.error('OpenAI error details:', {
        message: openaiError?.message,
        code: openaiError?.code,
        status: openaiError?.status,
        type: openaiError?.type,
      });
      return NextResponse.json(
        { 
          error: 'Failed to extract content', 
          details: openaiError?.message || 'OpenAI API call failed',
          code: openaiError?.code || 'openai_error'
        },
        { status: 500 }
      );
    }

    // Check if completion is valid
    if (!completion || !completion.choices || completion.choices.length === 0) {
      console.error('Invalid completion structure:', completion);
      return NextResponse.json(
        { error: 'Failed to extract content', details: 'Invalid response structure from AI' },
        { status: 500 }
      );
    }

    const firstChoice = completion.choices[0];
    if (!firstChoice || !firstChoice.message) {
      console.error('Invalid choice structure:', firstChoice);
      return NextResponse.json(
        { error: 'Failed to extract content', details: 'Invalid message structure from AI' },
        { status: 500 }
      );
    }

    // Check finish reason
    if (firstChoice.finish_reason === 'length') {
      console.warn('Response was truncated due to token limit');
    } else if (firstChoice.finish_reason === 'content_filter') {
      console.error('Response was filtered by content filter');
      return NextResponse.json(
        { error: 'Failed to extract content', details: 'Content was filtered by AI safety system' },
        { status: 500 }
      );
    }

    const raw = firstChoice.message.content?.trim() || '';
    console.log('Raw extraction response length:', raw.length);
    console.log('Raw extraction response preview:', raw.substring(0, 200));
    
    if (!raw || raw.length === 0) {
      console.error('Empty response from OpenAI. Full completion:', JSON.stringify(completion, null, 2));
      return NextResponse.json(
        { error: 'Failed to extract content', details: 'AI returned empty response. Please try again.' },
        { status: 500 }
      );
    }
    
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response that failed to parse:', raw);
      // Try to extract JSON block
      const match = raw.match(/\{[\s\S]*\}$/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          // If still fails, try to create a basic structure from the text
          parsed = {
            key_points: [raw.substring(0, 100)],
            grouped_concepts: [],
            deep_themes: [],
            pain_points: [],
            emotional_direction: 'neutral',
          };
        }
      } else {
        // Fallback: create basic structure from raw text
        parsed = {
          key_points: [raw.substring(0, 100)],
          grouped_concepts: [],
          deep_themes: [],
          pain_points: [],
          emotional_direction: 'neutral',
        };
      }
    }

    console.log('Parsed extraction:', JSON.stringify(parsed, null, 2));

    // Ensure all required fields exist with defaults
    if (!parsed.key_points || !Array.isArray(parsed.key_points)) {
      parsed.key_points = parsed.key_points || [];
    }
    if (!parsed.grouped_concepts || !Array.isArray(parsed.grouped_concepts)) {
      parsed.grouped_concepts = parsed.grouped_concepts || [];
    }
    if (!parsed.deep_themes || !Array.isArray(parsed.deep_themes)) {
      parsed.deep_themes = parsed.deep_themes || [];
    }
    if (!parsed.pain_points || !Array.isArray(parsed.pain_points)) {
      parsed.pain_points = parsed.pain_points || [];
    }
    if (!parsed.emotional_direction || typeof parsed.emotional_direction !== 'string') {
      parsed.emotional_direction = parsed.emotional_direction || 'neutral';
    }

    // If key_points is empty, try to generate from other fields or notes
    if (parsed.key_points.length === 0) {
      if (parsed.deep_themes && parsed.deep_themes.length > 0) {
        parsed.key_points = parsed.deep_themes.slice(0, 3);
      } else if (notes && notes.length > 0) {
        parsed.key_points = notes.slice(0, 3).map((n: any) => n.title || n.content?.substring(0, 50) || 'Key point');
      } else {
        parsed.key_points = ['Content analysis', 'Theme extraction', 'Insight generation'];
      }
    }

    return NextResponse.json({ extraction: parsed });
  } catch (error: any) {
    console.error('POST /api/article/extract error:', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { 
        error: 'Failed to extract content', 
        details: error?.message || 'Internal server error',
        type: error?.name || 'unknown_error'
      },
      { status: 500 }
    );
  }
}

