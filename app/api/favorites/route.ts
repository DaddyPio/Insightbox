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

    // Get user's favorites with inspiration details
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        daily_inspiration:inspiration_id (
          id,
          date,
          content_json,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json(
        { error: 'Failed to fetch favorites', details: error.message },
        { status: 500 }
      );
    }

    // Transform the data to flatten the structure
    const inspirations = (favorites || []).map((fav: any) => ({
      favoriteId: fav.id,
      favoritedAt: fav.created_at,
      ...fav.daily_inspiration,
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

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('inspiration_id', inspirationId)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Already favorited', favoriteId: existing.id });
    }

    // Add to favorites
    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({ inspiration_id: inspirationId })
      .select()
      .single();

    if (error) {
      console.error('Error adding favorite:', error);
      return NextResponse.json(
        { error: 'Failed to add favorite', details: error.message },
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

