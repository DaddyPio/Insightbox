import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side client with service role key for admin operations
// Create client only if environment variables are available
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient<Database>(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null;

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseServiceRoleKey;
}

