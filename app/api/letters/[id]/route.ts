// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';

export const dynamic = 'force-dynamic';

/**
 * GET /api/letters/[id]
 * Get a single letter by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized', details: 'User not found' }, { status: 401 });
    }

    const { data: letter, error } = await supabase
      .from('letters')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
      }
      console.error('Error fetching letter:', error);
      return NextResponse.json(
        { error: 'Failed to fetch letter', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ letter });
  } catch (error: any) {
    console.error('GET /api/letters/[id] error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * PUT /api/letters/[id]
 * Update a letter
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized', details: 'User not found' }, { status: 401 });
    }

    const body = await request.json();
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.aiLetter !== undefined) updateData.ai_letter = body.aiLetter;
    if (body.isFavorite !== undefined) updateData.is_favorite = body.isFavorite;
    if (body.tags !== undefined) updateData.tags = body.tags;

    const { data: letter, error } = await supabase
      .from('letters')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
      }
      console.error('Error updating letter:', error);
      return NextResponse.json(
        { error: 'Failed to update letter', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ letter });
  } catch (error: any) {
    console.error('PUT /api/letters/[id] error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * DELETE /api/letters/[id]
 * Delete a letter
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized', details: 'User not found' }, { status: 401 });
    }

    const { error } = await supabase
      .from('letters')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting letter:', error);
      return NextResponse.json(
        { error: 'Failed to delete letter', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Letter deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/letters/[id] error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

