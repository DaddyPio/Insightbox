// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';
import { openai, isOpenAIConfigured } from '@/lib/openai/client';
import { format } from 'date-fns';

const SYSTEM_PROMPT = `
You are a warm, wood‑tone, mature life coach. Speak concisely but poetically.
You must create a short daily encouragement that is INSPIRED BY (not copied from) the user's notes.
Hard rules:
- Output JSON ONLY with keys: 
  {
    "title": string,
    "message": string,               // 1–2 sentences, paraphrased, not copying any input text
    "song": { 
      "title": string, 
      "artist": string, 
      "youtube_url": string,         // direct YouTube watch/listen URL
      "youtube_candidates": string[],// 2-3 alternative public YouTube links
      "reason": string               // CRITICAL: Explain how the song's ACTUAL lyrics, theme, and emotional tone align with the message's spirit. Must be accurate to the song's real meaning, not generic. 1-2 sentences.
    }
  }
- Do NOT quote or reuse full sentences from the notes; summarize the essence and extend it.
- Keep message warm, grounded, and hopeful with a wooden aesthetic; avoid cliches.
- Language must match the dominant language of the input notes (zh‑TW, en, or ja).
- For "song": Choose a song whose lyrics, theme, and emotional message genuinely resonate with the daily inspiration message. The "reason" must accurately reflect the song's actual content and meaning, showing a real connection between the song's essence and the message's spirit.
`.trim();

function getTodayISODate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * GET /api/daily
 * Fetch today's inspiration if exists; otherwise 404
 */
export async function GET(request: NextRequest) {
  try {
    const hasAuth = !!request.headers.get('authorization');
    if (!hasAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const today = getTodayISODate();
    const supabase = supabaseFromRequest(request);
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize Supabase client' }, { status: 500 });
    }
    
    const { data, error } = await supabase
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

    const today = getTodayISODate();

    // Fetch all cards (notes)
    const supabase = supabaseFromRequest(request);
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize Supabase client' }, { status: 500 });
    }
    
    const { data: notes, error: notesError } = await supabase
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
Create the JSON only (no extra text). 

Requirements:
1. "message": 1–2 sentences, paraphrased/extended from the themes of the notes, not copied verbatim. Make it warm, inspiring, and spiritually uplifting.
2. "song": 
   - Choose a song whose lyrics, theme, and emotional message genuinely match the spirit of your "message"
   - The song should reinforce or complement the daily inspiration's core message
   - Provide a direct YouTube watch URL in "youtube_url" (format: https://www.youtube.com/watch?v=VIDEO_ID)
   - Provide 2-3 alternative YouTube links in "youtube_candidates" if available
   - "reason": Write 1-2 sentences that accurately explain how the song's ACTUAL lyrics, theme, or emotional tone connects with the message. Be specific about the connection - mention actual song elements (lyrics, mood, theme) that align with the message's meaning. Do NOT write generic reasons.

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

    // Normalize result and provide fallbacks when fields missing
    const fallbackMessage =
      selected
        .map((n) => (n?.content || '').trim())
        .filter(Boolean)
        .join('\n\n')
        .slice(0, 400) || 'Take a deep breath. Notice one small thing you can appreciate right now.';

    // Try to pull a plausible YouTube URL if model forgot the field
    const toYoutube = (v: any): string => {
      const text = (v || '').toString();
      const m = text.match(/https?:\/\/(www\.)?(youtube\.com\/watch\?v=[\w\-]+|youtu\.be\/[\w\-]+)/i);
      return m ? m[0] : '';
    };

    async function isPlayableYouTube(url: string): Promise<boolean> {
      if (!url) return false;
      try {
        const resp = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`);
        return resp.ok;
      } catch {
        return false;
      }
    }

    const normalized = {
      title: (parsed?.title || 'Daily Inspiration').toString().trim(),
      message: (parsed?.message || fallbackMessage).toString().trim(),
      song: {
        title: parsed?.song?.title ? parsed.song.title.toString().trim() : '',
        artist: parsed?.song?.artist ? parsed.song.artist.toString().trim() : '',
        youtube_url: parsed?.song?.youtube_url
          ? parsed.song.youtube_url.toString().trim()
          : toYoutube(parsed?.song?.reason || ''),
        youtube_candidates: Array.isArray(parsed?.song?.youtube_candidates)
          ? parsed.song.youtube_candidates.map((u: any) => u?.toString?.().trim()).filter(Boolean).slice(0, 3)
          : [],
        reason: parsed?.song?.reason ? parsed.song.reason.toString().trim() : '',
      },
    };

    // Validate youtube link; fallback to candidates; keep empty if none valid
    const candidates = [
      normalized.song.youtube_url,
      ...normalized.song.youtube_candidates,
    ].filter(Boolean);
    let picked = '';
    for (const url of candidates) {
      // Quick format check
      const validFormat = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/i.test(url);
      if (!validFormat) continue;
      if (await isPlayableYouTube(url)) {
        picked = url;
        break;
      }
    }
    // Fallback: build a YouTube search link by title + artist to ensure user can click and play
    if (!picked && (normalized.song.title || normalized.song.artist)) {
      const q = encodeURIComponent(`${normalized.song.title || ''} ${normalized.song.artist || ''} official`.trim());
      picked = `https://www.youtube.com/results?search_query=${q}`;
    }
    normalized.song.youtube_url = picked || '';
    delete (normalized.song as any).youtube_candidates;

    // Upsert by date
    const { data: upserted, error: upsertError } = await supabase
      .from('daily_inspiration')
      .upsert({ date: today, content_json: normalized }, { onConflict: 'date' })
      .select()
      .single();

    if (upsertError) {
      console.error('Upsert error (daily_inspiration):', upsertError);
      const errorDetails = upsertError.message || upsertError.code || JSON.stringify(upsertError);
      return NextResponse.json(
        { 
          error: 'Failed to save daily inspiration', 
          details: errorDetails,
          code: upsertError.code,
          hint: upsertError.hint
        },
        { status: 500 }
      );
    }

    if (!upserted) {
      return NextResponse.json(
        { error: 'Failed to save daily inspiration', details: 'No data returned from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ inspiration: upserted });
  } catch (error: any) {
    console.error('POST /api/daily error:', error);
    const errorMessage = error?.message || 'Internal error';
    const errorStack = process.env.NODE_ENV === 'development' ? error?.stack : undefined;
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorStack || error?.toString(),
      },
      { status: 500 }
    );
  }
}


