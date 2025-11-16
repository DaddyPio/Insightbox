import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import { isOpenAIConfigured } from '@/lib/openai/client';
import {
  generateTitle,
  classifyTopic,
  detectEmotion,
  generateTags,
  generateSummary,
} from '@/lib/openai/utils';

// Helper to get detailed error info
function getErrorDetails(error: any) {
  return {
    status: error?.status,
    message: error?.message,
    code: error?.code,
    type: error?.type,
    response: error?.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    } : undefined
  };
}

/**
 * POST /api/notes
 * Create a new note with AI processing
 */
export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.' },
        { status: 500 }
      );
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { error: 'OpenAI is not configured. Please set OPENAI_API_KEY in your .env.local file.' },
        { status: 500 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Failed to initialize Supabase client' },
        { status: 500 }
      );
    }

    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Generate AI insights in parallel
    const [title, topic, emotion] = await Promise.all([
      generateTitle(content),
      classifyTopic(content),
      detectEmotion(content),
    ]);

    // Generate tags and summary after we have title, topic, and emotion
    const [tags, summary] = await Promise.all([
      generateTags(content, title, topic, emotion),
      generateSummary(content, title),
    ]);

    // Insert note into database
    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .insert({
        title,
        content: content.trim(),
        topic,
        emotion,
        tags,
        summary,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create note',
          message: error.message || 'Database error',
          code: error.code,
          details: error.details,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/notes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = getErrorDetails(error);
    
    // Check if it's a quota/billing error
    const isQuotaError = error?.status === 429 && 
      (errorMessage.includes('quota') || errorMessage.includes('billing') || errorMessage.includes('exceeded'));
    
    return NextResponse.json(
      { 
        error: isQuotaError ? 'OpenAI API quota exceeded' : 'Internal server error',
        message: errorMessage,
        details: errorDetails,
        // Only include stack trace in development
        ...(process.env.NODE_ENV === 'development' && error instanceof Error && { stack: error.stack })
      },
      { status: error?.status || 500 }
    );
  }
}

/**
 * GET /api/notes
 * Get all notes with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.' },
        { status: 500 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Failed to initialize Supabase client' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const topic = searchParams.get('topic');
    const emotion = searchParams.get('emotion');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'latest';

    let query = supabaseAdmin
      .from('notes')
      .select('*');

    // Apply filters
    if (topic) {
      query = query.eq('topic', topic);
    }
    if (emotion) {
      query = query.eq('emotion', emotion);
    }
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Apply sorting
    if (sort === 'latest') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    }

    const { data: notes, error } = await query;

    if (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes: notes || [] });
  } catch (error) {
    console.error('Error in GET /api/notes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { details: error instanceof Error ? error.stack : String(error) })
      },
      { status: 500 }
    );
  }
}

