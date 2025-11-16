import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function supabaseFromRequest(request: NextRequest) {
  // Forward the end-user's JWT so that RLS policies apply
  const authHeader = request.headers.get('authorization') || '';
  const globalHeaders: Record<string, string> = {};
  if (authHeader) {
    globalHeaders['Authorization'] = authHeader;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: globalHeaders },
  });
}


