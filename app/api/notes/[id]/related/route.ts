import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { findRelatedNotes } from '@/lib/openai/utils';
import type { Note } from '@/lib/supabase/types';

/**
 * GET /api/notes/[id]/related
 * Get related notes for a given note
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get the current note
    const { data: currentNote, error: noteError } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (noteError || !currentNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Get all other notes
    const { data: allNotes, error: allNotesError } = await supabaseAdmin
      .from('notes')
      .select('*')
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(20); // Limit to recent 20 notes for AI processing

    if (allNotesError || !allNotes || allNotes.length === 0) {
      return NextResponse.json({ notes: [] });
    }

    // Use AI to find related notes
    const relatedIds = await findRelatedNotes(currentNote as Note, allNotes as Note[]);

    if (relatedIds.length === 0) {
      return NextResponse.json({ notes: [] });
    }

    // Fetch the related notes
    const { data: relatedNotes, error: relatedError } = await supabaseAdmin
      .from('notes')
      .select('*')
      .in('id', relatedIds);

    if (relatedError || !relatedNotes) {
      return NextResponse.json({ notes: [] });
    }

    // Return in the order suggested by AI
    const orderedNotes = relatedIds
      .map(id => relatedNotes.find(note => note.id === id))
      .filter((note): note is Note => note !== undefined) as Note[];

    return NextResponse.json({ notes: orderedNotes });
  } catch (error) {
    console.error('Error finding related notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

