import { NextRequest, NextResponse } from 'next/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';

export const dynamic = 'force-dynamic';

// Helper function to calculate next review date based on review stage
function calculateNextReviewDate(reviewStage: number): string {
  const today = new Date();
  const nextDate = new Date(today);

  switch (reviewStage) {
    case 0:
      nextDate.setDate(today.getDate() + 1); // Tomorrow
      break;
    case 1:
      nextDate.setDate(today.getDate() + 2); // +2 days
      break;
    case 2:
      nextDate.setDate(today.getDate() + 4); // +4 days
      break;
    case 3:
      nextDate.setDate(today.getDate() + 7); // +7 days
      break;
    case 4:
      nextDate.setDate(today.getDate() + 14); // +14 days
      break;
    case 5:
      // Mastered - no next review
      return null as any;
    default:
      nextDate.setDate(today.getDate() + 1);
  }

  return nextDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

// POST /api/vocab/words/[id]/review - Update review status
export async function POST(
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
    const { action } = body; // 'know', 'dont_know', 'master'

    // Get current word
    const { data: currentWord, error: fetchError } = await supabase
      .from('vocab_words')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !currentWord) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    let updateData: any = {};

    if (action === 'know') {
      // Increment review stage and schedule next review
      const newStage = Math.min((currentWord.review_stage || 0) + 1, 5);
      const nextReviewDate = calculateNextReviewDate(newStage);
      
      updateData.review_stage = newStage;
      updateData.next_review_date = nextReviewDate;
      updateData.status = newStage === 5 ? 'mastered' : 'reviewing';
    } else if (action === 'dont_know') {
      // Reset to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      updateData.next_review_date = tomorrow.toISOString().split('T')[0];
      updateData.review_stage = 0;
      updateData.status = 'reviewing';
    } else if (action === 'master') {
      // Mark as mastered
      updateData.status = 'mastered';
      updateData.review_stage = 5;
      updateData.next_review_date = null;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data: word, error } = await supabase
      .from('vocab_words')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating review:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ word });
  } catch (error: any) {
    console.error('Error in POST /api/vocab/words/[id]/review:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

