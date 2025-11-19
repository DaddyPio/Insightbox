// @ts-nocheck - Supabase type inference issue with conditional client
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';
import { generateWeeklyReview } from '@/lib/openai/utils';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export const dynamic = 'force-dynamic';

/**
 * GET /api/weekly
 * Get or generate weekly insights for the current week
 */
export async function GET(request: NextRequest) {
  try {
    // Require login
    const hasAuth = !!request.headers.get('authorization');
    if (!hasAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const weekParam = searchParams.get('week');
    
    // Get the week date (start of week, Monday)
    const weekDate = weekParam 
      ? new Date(weekParam) 
      : new Date();
    
    const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');

    const supabase = supabaseFromRequest(request);

    // Check if weekly insights already exist
    const { data: existingInsight, error: fetchError } = await supabase
      .from('weekly_insights')
      .select('*')
      .eq('week', weekKey)
      .single();

    if (existingInsight && !fetchError) {
      return NextResponse.json({ insight: existingInsight });
    }

    // Fetch all notes from this week
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())
      .order('created_at', { ascending: true });

    if (notesError) {
      console.error('Error fetching weekly notes:', notesError);
      return NextResponse.json(
        { error: 'Failed to fetch weekly notes' },
        { status: 500 }
      );
    }

    if (!notes || notes.length === 0) {
      return NextResponse.json({
        insight: {
          week: weekKey,
          summary: 'No notes found for this week.',
          insights: {
            themes: [],
            emotionalTrends: 'No data available',
            highlights: [],
            reflection: 'No notes were captured this week.',
          },
        },
      });
    }

    // Generate AI insights
    const aiInsights = await generateWeeklyReview(
      notes.map(note => ({
        title: note.title,
        content: note.content,
        topic: note.topic || '',
        emotion: note.emotion || '',
        tags: note.tags || [],
        created_at: note.created_at,
      }))
    );

    // Create summary text
    const summary = `This week you captured ${notes.length} note${notes.length !== 1 ? 's' : ''}. ${aiInsights.reflection}`;

    // Save to database
    const { data: savedInsight, error: saveError } = await supabase
      .from('weekly_insights')
      .insert({
        week: weekKey,
        summary,
        insights: aiInsights,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving weekly insight:', saveError);
      // Return the insight even if save fails
      return NextResponse.json({
        insight: {
          week: weekKey,
          summary,
          insights: aiInsights,
        },
      });
    }

    return NextResponse.json({ insight: savedInsight });
  } catch (error) {
    console.error('Error in GET /api/weekly:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

