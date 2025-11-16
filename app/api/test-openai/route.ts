import { NextRequest, NextResponse } from 'next/server';
import { openai, isOpenAIConfigured, testAPIKey } from '@/lib/openai/client';

/**
 * GET /api/test-openai
 * Test OpenAI API key and configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Check if configured
    if (!isOpenAIConfigured()) {
      return NextResponse.json({
        configured: false,
        error: 'OpenAI API key is not configured in .env.local'
      });
    }

    // Test API key
    const testResult = await testAPIKey();
    
    if (!testResult.valid) {
      // Get more details about the error
      let errorDetails = {};
      try {
        if (openai) {
          const testResponse = await openai.chat.completions.create({
            model: 'gpt-5.1',
            messages: [{ role: 'user', content: 'test' }],
            max_completion_tokens: 50,
          });
        }
      } catch (testError: any) {
        errorDetails = {
          status: testError?.status,
          code: testError?.code,
          type: testError?.type,
          message: testError?.message,
        };
      }
      
      return NextResponse.json({
        configured: true,
        valid: false,
        error: testResult.error,
        errorDetails: errorDetails,
        message: 'API key is configured but test failed. This usually means: 1) API key belongs to different project/organization, 2) Quota is 0 in Limits page, 3) Billing issue. Check https://platform.openai.com/account/limits for gpt-5.1 quota.'
      });
    }

    // Get API key info (first few characters for security)
    const apiKey = process.env.OPENAI_API_KEY?.trim() || '';
    const keyPreview = apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4);

    return NextResponse.json({
      configured: true,
      valid: true,
      keyPreview: keyPreview,
      message: 'API key is valid and working!'
    });
  } catch (error: any) {
    return NextResponse.json({
      configured: true,
      valid: false,
      error: error?.message || 'Unknown error',
      details: {
        status: error?.status,
        code: error?.code,
        type: error?.type
      }
    }, { status: 500 });
  }
}

