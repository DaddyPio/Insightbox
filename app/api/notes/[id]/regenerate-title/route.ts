// @ts-nocheck - Supabase type inference issue with conditional client
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import { generateTitle } from '@/lib/openai/utils';

/**
 * POST /api/notes/[id]/regenerate-title
 * Regenerate title for a note using AI
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 500 }
      );
    }

    const { id } = params;

    // Get the note
    const { data: note, error: noteError } = await supabaseAdmin!
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (noteError || !note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Generate new title
    const newTitle = await generateTitle(note.content);

    // Update the note
    const { data: updatedNote, error: updateError } = await supabaseAdmin!
      .from('notes')
      .update({ title: newTitle })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating note:', updateError);
      return NextResponse.json(
        { error: 'Failed to update note', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ note: updatedNote, newTitle });
  } catch (error) {
    console.error('Error in POST /api/notes/[id]/regenerate-title:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

