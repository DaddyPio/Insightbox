import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
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
    const { id } = params;

    // Get the note
    const { data: note, error } = await supabaseAdmin
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

