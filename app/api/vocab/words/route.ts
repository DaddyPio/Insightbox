import { NextRequest, NextResponse } from 'next/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';

export const dynamic = 'force-dynamic';

// GET /api/vocab/words - List/filter words
export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseFromRequest(request);
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const nextReviewDate = searchParams.get('next_review_date');

    let query = supabase
      .from('vocab_words')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    if (nextReviewDate) {
      query = query.eq('next_review_date', nextReviewDate);
    }

    const { data: words, error } = await query;

    if (error) {
      console.error('Error fetching words:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by search term if provided (client-side filtering for simplicity)
    let filteredWords = words || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filteredWords = filteredWords.filter((word: any) => {
        return (
          word.sound_like?.toLowerCase().includes(searchLower) ||
          word.correct_word?.toLowerCase().includes(searchLower) ||
          word.definition?.toLowerCase().includes(searchLower) ||
          word.context_sentence?.toLowerCase().includes(searchLower) ||
          word.collocations?.some((c: string) => c.toLowerCase().includes(searchLower)) ||
          word.tags?.some((t: string) => t.toLowerCase().includes(searchLower))
        );
      });
    }

    return NextResponse.json({ words: filteredWords });
  } catch (error: any) {
    console.error('Error in GET /api/vocab/words:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/vocab/words - Create new word
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseFromRequest(request);
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      sound_like,
      context_sentence,
      audio_url,
    } = body;

    const { data: word, error } = await supabase
      .from('vocab_words')
      .insert({
        user_id: user.id,
        sound_like: sound_like || null,
        context_sentence: context_sentence || null,
        audio_url: audio_url || null,
        status: 'inbox',
        review_stage: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating word:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ word }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/vocab/words:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

