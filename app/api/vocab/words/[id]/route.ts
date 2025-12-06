import { NextRequest, NextResponse } from 'next/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';

export const dynamic = 'force-dynamic';

// GET /api/vocab/words/[id] - Get single word
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseFromRequest(request);
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: word, error } = await supabase
      .from('vocab_words')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Word not found' }, { status: 404 });
      }
      console.error('Error fetching word:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ word });
  } catch (error: any) {
    console.error('Error in GET /api/vocab/words/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/vocab/words/[id] - Update word
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      correct_word,
      definition,
      context_sentence,
      my_work_sentence,
      my_general_sentence,
      collocations,
      part_of_speech,
      register,
      tags,
      audio_url,
      status,
      next_review_date,
      review_stage,
      pronunciation,
      synonyms,
      chinese_translation,
    } = body;

    // Build update object
    const updateData: any = {};
    if (sound_like !== undefined) updateData.sound_like = sound_like;
    if (correct_word !== undefined) updateData.correct_word = correct_word;
    if (definition !== undefined) updateData.definition = definition;
    if (context_sentence !== undefined) updateData.context_sentence = context_sentence;
    if (my_work_sentence !== undefined) updateData.my_work_sentence = my_work_sentence;
    if (my_general_sentence !== undefined) updateData.my_general_sentence = my_general_sentence;
    if (collocations !== undefined) updateData.collocations = collocations;
    if (part_of_speech !== undefined) updateData.part_of_speech = part_of_speech;
    if (register !== undefined) updateData.register = register;
    if (tags !== undefined) updateData.tags = tags;
    if (audio_url !== undefined) updateData.audio_url = audio_url;
    if (status !== undefined) updateData.status = status;
    if (next_review_date !== undefined) updateData.next_review_date = next_review_date;
    if (review_stage !== undefined) updateData.review_stage = review_stage;
    if (pronunciation !== undefined) updateData.pronunciation = pronunciation;
    if (synonyms !== undefined) updateData.synonyms = synonyms;
    if (chinese_translation !== undefined) updateData.chinese_translation = chinese_translation;

    const { data: word, error } = await supabase
      .from('vocab_words')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Word not found' }, { status: 404 });
      }
      console.error('Error updating word:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ word });
  } catch (error: any) {
    console.error('Error in PUT /api/vocab/words/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/vocab/words/[id] - Delete word
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseFromRequest(request);
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('vocab_words')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting word:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/vocab/words/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

