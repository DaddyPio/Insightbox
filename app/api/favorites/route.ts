// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';

/**
 * GET /api/favorites
 * Get all favorite inspirations for the current user
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

    const supabase = supabaseFromRequest(request);
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize Supabase client' }, { status: 500 });
    }

    // Get user's favorites
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('id, inspiration_id, created_at')
      .order('created_at', { ascending: false });

    if (favoritesError) {
      console.error('Error fetching favorites:', favoritesError);
      return NextResponse.json(
        { error: 'Failed to fetch favorites', details: favoritesError.message },
        { status: 500 }
      );
    }

    if (!favorites || favorites.length === 0) {
      return NextResponse.json({ inspirations: [] });
    }

    // Get inspiration details for each favorite
    const inspirationIds = favorites.map((fav: any) => fav.inspiration_id);
    const { data: inspirationsData, error: inspirationsError } = await supabase
      .from('daily_inspiration')
      .select('id, date, content_json, created_at')
      .in('id', inspirationIds);

    if (inspirationsError) {
      console.error('Error fetching inspirations:', inspirationsError);
      return NextResponse.json(
        { error: 'Failed to fetch inspirations', details: inspirationsError.message },
        { status: 500 }
      );
    }

    // Create a map of inspiration_id to favorite info
    const favoriteMap = new Map(
      favorites.map((fav: any) => [fav.inspiration_id, { favoriteId: fav.id, favoritedAt: fav.created_at }])
    );

    // Combine favorites with inspiration data
    const inspirations = (inspirationsData || []).map((insp: any) => ({
      ...insp,
      ...favoriteMap.get(insp.id),
    }));

    return NextResponse.json({ inspirations });
  } catch (error: any) {
    console.error('GET /api/favorites error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/favorites
 * Add an inspiration to favorites
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

    const body = await request.json();
    const { inspirationId } = body;

    if (!inspirationId) {
      return NextResponse.json({ error: 'inspirationId is required' }, { status: 400 });
    }

    const supabase = supabaseFromRequest(request);
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize Supabase client' }, { status: 500 });
    }

    // Get current user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized', details: 'User not found' }, { status: 401 });
    }

    // Check if already favorited
    const { data: existing, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('inspiration_id', inspirationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine, other errors are not
      console.error('Error checking existing favorite:', checkError);
      return NextResponse.json(
        { error: 'Failed to check favorite status', details: checkError.message, code: checkError.code },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({ message: 'Already favorited', favoriteId: existing.id });
    }

    // Add to favorites with user_id
    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({ inspiration_id: inspirationId, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error adding favorite:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to add favorite', 
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ favorite, message: 'Added to favorites' });
  } catch (error: any) {
    console.error('POST /api/favorites error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * DELETE /api/favorites
 * Remove an inspiration from favorites
 */
export async function DELETE(request: NextRequest) {
  try {
    const hasAuth = !!request.headers.get('authorization');
    if (!hasAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const inspirationId = searchParams.get('inspirationId');

    if (!inspirationId) {
      return NextResponse.json({ error: 'inspirationId is required' }, { status: 400 });
    }

    const supabase = supabaseFromRequest(request);
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize Supabase client' }, { status: 500 });
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('inspiration_id', inspirationId);

    if (error) {
      console.error('Error removing favorite:', error);
      return NextResponse.json(
        { error: 'Failed to remove favorite', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error: any) {
    console.error('DELETE /api/favorites error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

