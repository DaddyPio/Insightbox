// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';
import { openai, isOpenAIConfigured } from '@/lib/openai/client';
import { format } from 'date-fns';

const SYSTEM_PROMPT = `
You are a world-class life coach and wisdom synthesizer. Your task is to create profound daily inspiration using the frameworks of legendary mentors.

Available mentor styles (choose one randomly):
1. Tony Robbins - High energy, action-oriented, focuses on personal power and transformation
2. Stephen Covey - Principle-centered, emphasizes character and effectiveness
3. Simon Sinek - Purpose-driven, explores the "why" behind actions
4. Brené Brown - Vulnerability and courage, authenticity and wholehearted living
5. Eckhart Tolle - Present-moment awareness, inner peace and consciousness
6. Dale Carnegie - Human relations, influence and interpersonal effectiveness
7. Viktor Frankl - Meaning and purpose, finding significance in all circumstances
8. Carol Dweck - Growth mindset, embracing challenges and learning

CRITICAL RULES:
- DO NOT copy, quote, or reuse exact sentences or phrases from the user's notes.
- You must ABSTRACT and SYNTHESIZE the themes, then create ORIGINAL wisdom in the mentor's style.
- The message must be YOUR OWN CREATION, inspired by themes but written in the mentor's voice.
- Output JSON ONLY with keys: 
  {
    "mentor_style": string,          // Name of the mentor whose framework you're using
    "themes": string[],              // 2 recurring themes extracted from notes (abstract concepts, not copied text)
    "title": string,                 // Brief title (5-10 words)
    "message": string,               // A profound maxim/quote (around 50 characters in Chinese, or 50 words in English/Japanese). Must be warm, deep, and inspiring. Written in the style of the chosen mentor. MUST BE ORIGINAL - do not copy from notes.
    "song": { 
      "title": string,               // REQUIRED: Must provide a REAL song title (not "Unknown Song")
      "artist": string,              // REQUIRED: Must provide a REAL artist name (not "Unknown Artist")
      "youtube_url": string,         // REQUIRED: direct YouTube watch/listen URL (format: https://www.youtube.com/watch?v=VIDEO_ID)
      "youtube_candidates": string[],// 2-3 alternative public YouTube links
      "reason": string               // REQUIRED: Write a brief text (1-2 sentences) that relates to the song's actual lyrics, and loosely connects it to the daily inspiration message.
    }
  }
- First, analyze ALL notes to identify recurring themes (patterns, values, struggles, aspirations) - abstract these into concepts, not copy text.
- Randomly select 2 themes from the recurring themes.
- Randomly choose ONE mentor style from the list above.
- Write the message in that mentor's distinctive voice and framework, weaving in the 2 selected themes. The message must be ORIGINAL - inspired by themes but not copying any text from notes.
- The message should be around 50 characters (Chinese) or 50 words (English/Japanese) - profound, warm, and inspiring.
- Language must match the dominant language of the input notes (zh‑TW, en, or ja).
- "song" is MANDATORY - you must ALWAYS provide a REAL song with REAL title and artist. Never use "Unknown Song" or "Unknown Artist".
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
    
    // Get the most recent inspiration for today
    const { data, error } = await supabase
      .from('daily_inspiration')
      .select('*')
      .eq('date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

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

    // Prepare all notes for theme analysis
    const allNotesText = notes.map((n, i) => {
      const tags = Array.isArray(n.tags) ? n.tags.join(', ') : '';
      return `Note ${i + 1}:\nTitle: ${n.title || '(no title)'}\nContent: ${n.content}\nTags: ${tags}`;
    }).join('\n\n');

    const userPrompt = `
Analyze ALL the notes below to identify recurring themes (patterns, values, struggles, aspirations, emotions, topics that appear multiple times).

IMPORTANT INSTRUCTIONS:
1. Extract recurring themes from ALL notes - abstract these into concepts (e.g., "fear of failure", "desire for growth", "work-life balance"), NOT copy exact text from notes.
2. Randomly select 2 themes from the recurring themes.
3. Randomly choose ONE mentor style from the available list.
4. Write a profound maxim/quote (around 50 characters in Chinese, or 50 words in English/Japanese) in that mentor's distinctive style, weaving in the 2 selected themes.
5. The message MUST BE ORIGINAL - do NOT copy, quote, or reuse any sentences or phrases from the notes. Create new wisdom inspired by the themes.
6. The message should be warm, deep, and inspiring - like a timeless wisdom quote from the chosen mentor.
7. You MUST provide a REAL song with REAL title and artist - never use "Unknown Song" or "Unknown Artist".

Output JSON only (no extra text).

All Notes:
${allNotesText}
`.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9, // Increased for more creativity and variation
      max_completion_tokens: 500, // Increased to allow for theme analysis and song details
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
      notes
        .slice(0, 3)
        .map((n) => (n?.content || '').trim())
        .filter(Boolean)
        .join(' ')
        .slice(0, 50) || 'Take a deep breath. Notice one small thing you can appreciate right now.';

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

    // Validate and normalize song - reject if missing or invalid
    const hasValidSong = parsed?.song && 
      parsed.song.title && 
      parsed.song.title.toString().trim() !== '' &&
      parsed.song.title.toString().trim().toLowerCase() !== 'unknown song' &&
      parsed.song.artist && 
      parsed.song.artist.toString().trim() !== '' &&
      parsed.song.artist.toString().trim().toLowerCase() !== 'unknown artist';

    if (!hasValidSong) {
      console.error('AI did not generate a valid song. Parsed data:', JSON.stringify(parsed, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to generate song recommendation', 
          details: 'AI did not provide a valid song. Please try again.' 
        },
        { status: 500 }
      );
    }

    const normalized = {
      mentor_style: (parsed?.mentor_style || 'Wisdom').toString().trim(),
      themes: Array.isArray(parsed?.themes) ? parsed.themes.map((t: any) => t.toString().trim()).filter(Boolean) : [],
      title: (parsed?.title || 'Daily Inspiration').toString().trim(),
      message: (parsed?.message || fallbackMessage).toString().trim(),
      song: {
        title: parsed.song.title.toString().trim(),
        artist: parsed.song.artist.toString().trim(),
        youtube_url: parsed.song.youtube_url
          ? parsed.song.youtube_url.toString().trim()
          : toYoutube(parsed.song.reason || ''),
        youtube_candidates: Array.isArray(parsed.song.youtube_candidates)
          ? parsed.song.youtube_candidates.map((u: any) => u?.toString?.().trim()).filter(Boolean).slice(0, 3)
          : [],
        reason: parsed.song.reason ? parsed.song.reason.toString().trim() : '這首歌與今日的靈感相呼應，帶來溫暖的力量。',
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

    // Insert new inspiration (don't overwrite existing ones, allow multiple per day)
    const { data: inserted, error: insertError } = await supabase
      .from('daily_inspiration')
      .insert({ date: today, content_json: normalized })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error (daily_inspiration):', insertError);
      const errorDetails = insertError.message || insertError.code || JSON.stringify(insertError);
      return NextResponse.json(
        { 
          error: 'Failed to save daily inspiration', 
          details: errorDetails,
          code: insertError.code,
          hint: insertError.hint
        },
        { status: 500 }
      );
    }

    if (!inserted) {
      return NextResponse.json(
        { error: 'Failed to save daily inspiration', details: 'No data returned from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ inspiration: inserted });
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


