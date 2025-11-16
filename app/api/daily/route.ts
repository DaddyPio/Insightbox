// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import { openai, isOpenAIConfigured } from '@/lib/openai/client';
import { format } from 'date-fns';

const SYSTEM_PROMPT = `
You are a warm, wood-tone, mature life coach. Speak concisely but poetically.
Output JSON ONLY with keys: title, message, song { title, artist, reason }.
Tone requirements:
- Warm, grounded, hopeful, wooden aesthetic
- Encourage gentle action and self-reflection
- Avoid cliches; be concrete and relatable
Language:
- Match the dominant language of input cards (zh-TW, en, or ja).
`.trim();

function getTodayISODate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * GET /api/daily
 * Fetch today's inspiration if exists; otherwise 404
 */
export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const today = getTodayISODate();
    const { data, error } = await supabaseAdmin
      .from('daily_inspiration')
      .select('*')
      .eq('date', today)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Not found for today' }, { status: 404 });
    }

    return NextResponse.json({ inspiration: data });
  } catch (error: any) {
    console.error('GET /api/daily error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/daily
 * Generate today's inspiration (idempotent - upsert by date)
 */
export async function POST() {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }
    if (!isOpenAIConfigured() || !openai) {
      return NextResponse.json({ error: 'OpenAI is not configured' }, { status: 500 });
    }

    const today = getTodayISODate();

    // Fetch all cards (notes)
    const { data: notes, error: notesError } = await supabaseAdmin
      .from('notes')
      .select('id, title, content, tags')
      .order('created_at', { ascending: false });

    if (notesError) {
      return NextResponse.json({ error: 'Failed to fetch notes', details: notesError.message }, { status: 500 });
    }
    if (!notes || notes.length < 1) {
      return NextResponse.json({ error: 'No notes available to generate inspiration' }, { status: 400 });
    }

    // Randomly select 2 notes
    const shuffled = [...notes].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(2, shuffled.length));
    const selectedText = selected.map((n, i) => {
      const tags = Array.isArray(n.tags) ? n.tags.join(', ') : '';
      return `Card ${i + 1}:\nTitle: ${n.title || '(no title)'}\nContent: ${n.content}\nTags: ${tags}`;
    }).join('\n\n');

    const userPrompt = `
These are 2 randomly selected cards from all saved cards.
Generate today's inspiration with this JSON schema:
{
  "title": string,
  "message": string,
  "song": { "title": string, "artist": string, "reason": string }
}

Cards:
${selectedText}
`.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_completion_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // If model returned text, try to extract JSON block
      const match = raw.match(/\{[\s\S]*\}$/);
      parsed = match ? JSON.parse(match[0]) : { title: 'Daily Inspiration', message: raw };
    }

    // Upsert by date
    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from('daily_inspiration')
      .upsert({ date: today, content_json: parsed }, { onConflict: 'date' })
      .select()
      .single();

    if (upsertError) {
      console.error('Upsert error (daily_inspiration):', upsertError);
      return NextResponse.json(
        { error: 'Failed to save daily inspiration', details: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ inspiration: upserted });
  } catch (error: any) {
    console.error('POST /api/daily error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}


