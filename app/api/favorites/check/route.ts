// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';

/**
 * GET /api/favorites/check?inspirationId=xxx
 * Check if an inspiration is favorited by the current user
 */
export async function GET(request: NextRequest) {
  try {
    const hasAuth = !!request.headers.get('authorization');
    if (!hasAuth) {
      return NextResponse.json({ isFavorited: false });
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ isFavorited: false });
    }

    const { searchParams } = new URL(request.url);
    const inspirationId = searchParams.get('inspirationId');

    if (!inspirationId) {
      return NextResponse.json({ isFavorited: false });
    }

    const supabase = supabaseFromRequest(request);
    if (!supabase) {
      return NextResponse.json({ isFavorited: false });
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('inspiration_id', inspirationId)
      .single();

    return NextResponse.json({ isFavorited: !!data && !error });
  } catch (error: any) {
    console.error('GET /api/favorites/check error:', error);
    return NextResponse.json({ isFavorited: false });
  }
}

