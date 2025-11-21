// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';

export const dynamic = 'force-dynamic';

/**
 * GET /api/letters
 * Get all letters for the current user
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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized', details: 'User not found' }, { status: 401 });
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const childName = searchParams.get('childName');

    let query = supabase
      .from('letters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (childName && childName !== 'all') {
      query = query.eq('child_name', childName);
    }

    const { data: letters, error } = await query;

    if (error) {
      console.error('Error fetching letters:', error);
      return NextResponse.json(
        { error: 'Failed to fetch letters', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ letters: letters || [] });
  } catch (error: any) {
    console.error('GET /api/letters error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/letters
 * Save a new letter
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
    const { childName, childLabel, title, rawText, aiLetter, aiSummary, tone, tags } = body;

    if (!childName || !rawText || !aiLetter) {
      return NextResponse.json(
        { error: 'childName, rawText, and aiLetter are required' },
        { status: 400 }
      );
    }

    const { data: letter, error } = await supabase
      .from('letters')
      .insert({
        user_id: user.id,
        child_name: childName,
        child_label: childLabel || null,
        title: title || null,
        raw_text: rawText,
        ai_letter: aiLetter,
        ai_summary: aiSummary || null,
        tone: tone || 'warm',
        tags: tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving letter:', error);
      return NextResponse.json(
        { error: 'Failed to save letter', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ letter }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/letters error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

