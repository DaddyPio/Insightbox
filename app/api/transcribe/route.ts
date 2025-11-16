import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/openai/utils';

/**
 * POST /api/transcribe
 * Transcribe audio file to text using Whisper API
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'File must be an audio file' },
        { status: 400 }
      );
    }

    // Transcribe audio
    const transcription = await transcribeAudio(audioFile);

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error('Error in POST /api/transcribe:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

