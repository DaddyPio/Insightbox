// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';
import { openai, isOpenAIConfigured } from '@/lib/openai/client';

export const dynamic = 'force-dynamic';

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

    let completion;
    try {
      console.log('Calling OpenAI API for article generation with prompt length:', userPrompt.length);
      completion = await openai.chat.completions.create({
        model: 'gpt-5.1',
        messages: [
          { role: 'system', content: ARTICLE_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_completion_tokens: 2000, // Increased for longer articles
      });
      console.log('OpenAI API response received:', {
        choices: completion.choices?.length || 0,
        finish_reason: completion.choices?.[0]?.finish_reason,
        has_content: !!completion.choices?.[0]?.message?.content,
      });
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError);
      return NextResponse.json(
        { 
          error: 'Failed to generate article', 
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
        { error: 'Failed to generate article', details: 'Invalid response structure from AI' },
        { status: 500 }
      );
    }

    const firstChoice = completion.choices[0];
    if (!firstChoice || !firstChoice.message) {
      console.error('Invalid choice structure:', firstChoice);
      return NextResponse.json(
        { error: 'Failed to generate article', details: 'Invalid message structure from AI' },
        { status: 500 }
      );
    }

    // Check finish reason
    if (firstChoice.finish_reason === 'length') {
      console.warn('Response was truncated due to token limit');
    } else if (firstChoice.finish_reason === 'content_filter') {
      console.error('Response was filtered by content filter');
      return NextResponse.json(
        { error: 'Failed to generate article', details: 'Content was filtered by AI safety system' },
        { status: 500 }
      );
    }

    const raw = firstChoice.message.content?.trim() || '';
    console.log('Raw article response length:', raw.length);
    console.log('Raw article response preview:', raw.substring(0, 300));
    
    if (!raw || raw.length === 0) {
      console.error('Empty response from OpenAI. Full completion:', JSON.stringify(completion, null, 2));
      return NextResponse.json(
        { error: 'Failed to generate article', details: 'AI returned empty response. Please try again.' },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response that failed to parse:', raw.substring(0, 500));
      // Try to extract JSON block
      const match = raw.match(/\{[\s\S]*\}$/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          // If still fails, create structure from raw text
          parsed = { 
            title: selectedTopic?.title || 'Article', 
            content: raw, 
            key_quote: raw.substring(0, 100) 
          };
        }
      } else {
        // Fallback: create structure from raw text
        parsed = { 
          title: selectedTopic?.title || 'Article', 
          content: raw, 
          key_quote: raw.substring(0, 100) 
        };
      }
    }

    console.log('Parsed article:', {
      hasTitle: !!parsed.title,
      hasContent: !!parsed.content,
      contentLength: parsed.content?.length || 0,
    });

    // Validate article has required fields
    if (!parsed.title || !parsed.content) {
      console.error('Invalid article format - missing title or content:', parsed);
      return NextResponse.json(
        { error: 'Failed to generate article', details: 'AI did not generate valid article structure' },
        { status: 500 }
      );
    }

    return NextResponse.json({ article: parsed });
  } catch (error: any) {
    console.error('POST /api/article/generate error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

