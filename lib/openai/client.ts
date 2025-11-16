import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY?.trim();

// Create client only if API key is available
export const openai = apiKey ? new OpenAI({ apiKey }) : null;

// Helper function to check if OpenAI is configured
export function isOpenAIConfigured(): boolean {
  return !!apiKey;
}

// Helper function to test API key
export async function testAPIKey(): Promise<{ valid: boolean; error?: string }> {
  if (!openai) {
    return { valid: false, error: 'OpenAI client not initialized' };
  }

  try {
    // Make a simple test call
    const response = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [{ role: 'user', content: 'test' }],
      max_completion_tokens: 50,
    });
    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: error?.message || 'Unknown error',
    };
  }
}

