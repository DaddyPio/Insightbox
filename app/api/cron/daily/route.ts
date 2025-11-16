// @ts-nocheck
import { NextRequest } from 'next/server';
// Reuse the POST handler from /api/daily
import { POST as generateDaily } from '../../daily/route';

/**
 * GET /api/cron/daily
 * Vercel Scheduled Function target - runs once per day (see vercel.json)
 */
export async function GET(request: NextRequest) {
  // Simply invoke the generator; it will upsert today's record
  const res = await generateDaily();
  return res;
}


