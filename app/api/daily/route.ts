// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';
import { openai, isOpenAIConfigured } from '@/lib/openai/client';
import { format } from 'date-fns';

const SYSTEM_PROMPT = `
You are a world-class life coach and wisdom synthesizer. Your task is to create profound daily inspiration based on authentic quotes and wisdom from legendary mentors.

Available mentors (choose one randomly):
1. Tony Robbins - High energy, action-oriented, focuses on personal power and transformation. Famous works: "Awaken the Giant Within", "Unlimited Power"
2. Stephen Covey - Principle-centered, emphasizes character and effectiveness. Famous works: "The 7 Habits of Highly Effective People"
3. Simon Sinek - Purpose-driven, explores the "why" behind actions. Famous works: "Start With Why", "Leaders Eat Last"
4. Brené Brown - Vulnerability and courage, authenticity and wholehearted living. Famous works: "Daring Greatly", "The Gifts of Imperfection"
5. Eckhart Tolle - Present-moment awareness, inner peace and consciousness. Famous works: "The Power of Now", "A New Earth"
6. Dale Carnegie - Human relations, influence and interpersonal effectiveness. Famous works: "How to Win Friends and Influence People"
7. Viktor Frankl - Meaning and purpose, finding significance in all circumstances. Famous works: "Man's Search for Meaning"
8. Carol Dweck - Growth mindset, embracing challenges and learning. Famous works: "Mindset: The New Psychology of Success"

YOUR TASK:
1. Randomly select ONE mentor from the list above.
2. Recall or generate an authentic, well-known quote or wisdom statement from that mentor's actual books, speeches, or published articles. This should be a REAL quote that reflects their core philosophy.
3. Extract the CORE MESSAGE or ESSENCE from that quote.
4. Based on that core message, create a NEW, original inspirational message (around 50 characters in Chinese, or 50 words in English/Japanese) that expands on the wisdom in a warm, profound, and inspiring way. The new message should be written in the mentor's distinctive voice and style, but it should be YOUR CREATIVE EXPANSION of their wisdom, not a direct copy.

CRITICAL RULES:
- The quote you reference should be AUTHENTIC to the mentor's actual teachings (from their books, speeches, or published works).
- The final "message" must be YOUR ORIGINAL CREATION that expands on the quote's core wisdom, not a direct copy.
- Output JSON ONLY with keys: 
  {
    "mentor_style": string,          // Name of the mentor you selected
    "original_quote": string,        // The authentic quote/wisdom from the mentor (in the original language, or translated if needed)
    "core_message": string,          // The core essence/theme extracted from the quote
    "title": string,                 // Brief title (5-10 words) that captures the inspiration
    "message": string,               // YOUR ORIGINAL inspirational message (around 50 characters in Chinese, or 50 words in English/Japanese). Must be warm, deep, and inspiring. Written in the mentor's voice but as YOUR CREATIVE EXPANSION.
    "song": { 
      "title": string,               // REQUIRED: Must provide a REAL song title (not "Unknown Song")
      "artist": string,              // REQUIRED: Must provide a REAL artist name (not "Unknown Artist")
      "youtube_url": string,         // REQUIRED: direct YouTube watch/listen URL (format: https://www.youtube.com/watch?v=VIDEO_ID)
      "youtube_candidates": string[],// 2-3 alternative public YouTube links
      "reason": string               // REQUIRED: Write a brief text (1-2 sentences) that relates to the song's actual lyrics, and loosely connects it to the daily inspiration message.
    }
  }
- The language of the output should be Chinese (Traditional) by default, but you can also use English or Japanese if appropriate.
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

    // Initialize Supabase client for database operations
    const supabase = supabaseFromRequest(request);
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize Supabase client' }, { status: 500 });
    }

    const userPrompt = `
Generate today's daily inspiration following these steps:

1. RANDOMLY SELECT ONE mentor from the available list (Tony Robbins, Stephen Covey, Simon Sinek, Brené Brown, Eckhart Tolle, Dale Carnegie, Viktor Frankl, or Carol Dweck).

2. RECALL or GENERATE an authentic, well-known quote or wisdom statement from that mentor's actual books, speeches, or published articles. This should be a REAL quote that reflects their core philosophy. Examples:
   - Tony Robbins: "The quality of your life is the quality of your relationships."
   - Stephen Covey: "Begin with the end in mind."
   - Simon Sinek: "People don't buy what you do; they buy why you do it."
   - Brené Brown: "Vulnerability is not weakness; it's our greatest measure of courage."
   - Eckhart Tolle: "The power of now can only be realized in the present moment."
   - Dale Carnegie: "You can make more friends in two months by becoming interested in other people than you can in two years by trying to get other people interested in you."
   - Viktor Frankl: "Everything can be taken from a man but one thing: the last of the human freedoms—to choose one's attitude in any given set of circumstances."
   - Carol Dweck: "The view you adopt for yourself profoundly affects the way you lead your life."

3. EXTRACT the CORE MESSAGE or ESSENCE from that quote. What is the fundamental wisdom or insight?

4. CREATE A NEW, ORIGINAL inspirational message (around 50 characters in Chinese, or 50 words in English/Japanese) that expands on the quote's core wisdom. This new message should:
   - Be written in the mentor's distinctive voice and style
   - Be YOUR CREATIVE EXPANSION, not a direct copy of the original quote
   - Be warm, profound, and inspiring
   - Feel like timeless wisdom that could have come from that mentor

5. Provide a REAL song recommendation that connects to the inspiration.

Output JSON only (no extra text). Use Traditional Chinese for the message unless specified otherwise.
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
    const fallbackMessage = 'Take a deep breath. Notice one small thing you can appreciate right now.';

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
      original_quote: (parsed?.original_quote || '').toString().trim(),
      core_message: (parsed?.core_message || '').toString().trim(),
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


