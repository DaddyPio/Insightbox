// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
// Reuse the POST handler from /api/daily
import { POST as generateDaily } from '../../daily/route';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/daily
 * Vercel Scheduled Function target - runs once per day (see vercel.json)
 */
export async function GET(request: NextRequest | null) {
  try {
    // Verify this is called from Vercel Cron (optional check)
    const authHeader = request?.headers?.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a mock request for the POST handler
    const mockRequest = new NextRequest('http://localhost/api/daily', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // For cron, we need to use service role, so we don't pass auth header
      },
    });

    // Simply invoke the generator; it will upsert today's record
    const res = await generateDaily(mockRequest);
    return res;
  } catch (error: any) {
    console.error('Cron daily error:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily inspiration', details: error?.message },
      { status: 500 }
    );
  }
}


