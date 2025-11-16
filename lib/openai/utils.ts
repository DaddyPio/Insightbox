// @ts-nocheck - OpenAI client type inference issue with conditional client
import { openai } from './client';
import { PROMPTS } from './prompts';
import type { Note } from '../supabase/types';

/**
 * Helper function to retry API calls with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      // Log detailed error information
      console.error('OpenAI API Error:', {
        status: error?.status,
        message: error?.message,
        code: error?.code,
        type: error?.type,
        response: error?.response
      });
      
      // Check if it's a quota error (not rate limit)
      const errorMessage = error?.message || '';
      const isQuotaError = error?.status === 429 && 
        (errorMessage.includes('quota') || errorMessage.includes('billing') || errorMessage.includes('exceeded'));
      
      // If it's a quota error, don't retry - throw immediately with detailed message
      if (isQuotaError) {
        const detailedError = new Error(
          `OpenAI API quota exceeded. Status: ${error?.status}. Message: ${errorMessage}. 
          
Possible solutions:
1. Check if your API key belongs to the correct project/organization
2. Go to https://platform.openai.com/account/limits and verify gpt-5.1 quota is not 0
3. Request quota increase if needed
4. Check billing at https://platform.openai.com/account/billing
5. Ensure payment method is added and account has sufficient balance`
        );
        (detailedError as any).status = error?.status;
        (detailedError as any).code = error?.code;
        (detailedError as any).response = error?.response;
        throw detailedError;
      }
      
      // If it's a 429 error (rate limit) and we have retries left, wait and retry
      if (error?.status === 429 && attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Generate a title for a note using AI
 */
export async function generateTitle(content: string): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI client is not initialized');
  }
  
  return retryWithBackoff(async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: 'You are a creative assistant that generates insightful, thought-provoking titles that capture deeper meanings.' },
        { role: 'user', content: PROMPTS.generateTitle(content) },
      ],
      temperature: 0.8,
      max_completion_tokens: 50,
    });

    return response.choices[0]?.message?.content?.trim() || 'Untitled Note';
  });
}

/**
 * Classify the topic of a note
 */
export async function classifyTopic(content: string): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI client is not initialized');
  }
  
  return retryWithBackoff(async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that classifies notes into topics.' },
        { role: 'user', content: PROMPTS.classifyTopic(content) },
      ],
      temperature: 0.3,
      max_completion_tokens: 30,
    });

    return response.choices[0]?.message?.content?.trim() || 'Other';
  });
}

/**
 * Detect emotion in a note
 */
export async function detectEmotion(content: string): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI client is not initialized');
  }
  
  return retryWithBackoff(async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that detects emotions in text.' },
        { role: 'user', content: PROMPTS.detectEmotion(content) },
      ],
      temperature: 0.3,
      max_completion_tokens: 30,
    });

    return response.choices[0]?.message?.content?.trim() || 'Neutral';
  });
}

/**
 * Generate tags for a note
 */
export async function generateTags(
  content: string,
  title: string,
  topic: string,
  emotion: string
): Promise<string[]> {
  if (!openai) {
    throw new Error('OpenAI client is not initialized');
  }
  
  return retryWithBackoff(async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: 'You are a creative assistant that generates insightful, meaningful tags. Use Chinese if the content is in Chinese, English if in English.' },
        { role: 'user', content: PROMPTS.generateTags(content, title, topic, emotion) },
      ],
      temperature: 0.8,
      max_completion_tokens: 100,
    });

    const tagsText = response.choices[0]?.message?.content?.trim() || '';
    return tagsText
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 5); // Limit to 5 tags
  });
}

/**
 * Generate a summary for a note
 */
export async function generateSummary(content: string, title: string): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI client is not initialized');
  }
  
  return retryWithBackoff(async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: 'You are a creative and insightful assistant that generates summaries with depth and perspective, revealing underlying themes and implications.' },
        { role: 'user', content: PROMPTS.generateSummary(content, title) },
      ],
      temperature: 0.8,
      max_completion_tokens: 200,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  });
}

/**
 * Find related notes using AI
 */
export async function findRelatedNotes(
  currentNote: Note,
  otherNotes: Note[]
): Promise<string[]> {
  if (otherNotes.length === 0) return [];
  if (!openai) {
    throw new Error('OpenAI client is not initialized');
  }

  return retryWithBackoff(async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that finds related notes based on content similarity.' },
        { role: 'user', content: PROMPTS.findRelatedNotes(currentNote, otherNotes) },
      ],
      temperature: 0.5,
      max_completion_tokens: 100,
    });

    const idsText = response.choices[0]?.message?.content?.trim() || '';
    const relatedIds = idsText
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0)
      .slice(0, 3); // Limit to 3 related notes

    return relatedIds;
  });
}

/**
 * Generate weekly review insights
 */
export async function generateWeeklyReview(
  notes: Array<{
    title: string;
    content: string;
    topic: string;
    emotion: string;
    tags: string[];
    created_at: string;
  }>
): Promise<{
  themes: string[];
  emotionalTrends: string;
  highlights: string[];
  reflection: string;
}> {
  if (!openai) {
    throw new Error('OpenAI client is not initialized');
  }
  
  return retryWithBackoff(async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that analyzes weekly notes and generates insights. Always return valid JSON.' },
        { role: 'user', content: PROMPTS.weeklyReview(notes) },
      ],
      temperature: 0.7,
      max_completion_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    try {
      const content = response.choices[0]?.message?.content?.trim() || '{}';
      const parsed = JSON.parse(content);
      return {
        themes: parsed.themes || [],
        emotionalTrends: parsed.emotionalTrends || '',
        highlights: parsed.highlights || [],
        reflection: parsed.reflection || '',
      };
    } catch (error) {
      console.error('Error parsing weekly review response:', error);
      return {
        themes: [],
        emotionalTrends: '',
        highlights: [],
        reflection: 'Unable to generate reflection at this time.',
      };
    }
  });
}

/**
 * Transcribe audio using Whisper API
 */
export async function transcribeAudio(audioFile: File | Blob): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI client is not initialized');
  }
  // Convert Blob to File if needed
  const file = audioFile instanceof File 
    ? audioFile 
    : new File([audioFile], 'recording.webm', { type: audioFile.type || 'audio/webm' });

  const response = await openai.audio.transcriptions.create({
    file: file,
    model: 'whisper-1',
  });

  return response.text;
}

