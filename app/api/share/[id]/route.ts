// @ts-nocheck - Supabase type inference issue with conditional client
import { NextRequest, NextResponse } from 'next/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';
import { toPng } from 'html-to-image';

/**
 * GET /api/share/[id]
 * Generate a shareable image for a note
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require login
    const hasAuth = !!request.headers.get('authorization');
    if (!hasAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;

    const supabase = supabaseFromRequest(request);
    // Get the note
    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // This endpoint returns the note data
    // The actual image generation happens on the client side
    // using the /share/[id] page
    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error in GET /api/share/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

