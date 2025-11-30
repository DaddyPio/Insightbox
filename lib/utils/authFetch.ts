import { supabaseBrowser } from '@/lib/supabase/browser';

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  try {
    const { data, error } = await supabaseBrowser.auth.getSession();
    
    if (error) {
      console.error('❌ Error getting session:', error);
    }
    
    const token = data?.session?.access_token;
    
    console.log('🔐 authFetch - Session check:', {
      hasSession: !!data?.session,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      error: error?.message,
    });
    
    // Don't override headers if body is FormData (browser sets Content-Type automatically)
    const isFormData = init.body instanceof FormData;
    const headers = new Headers(init.headers || {});
  
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log('✅ Authorization header set');
    } else {
      console.warn('⚠️ No auth token found in session. User may not be logged in.');
      console.warn('⚠️ Session data:', data);
    }
  
    // Remove Content-Type for FormData to let browser set it with boundary
    if (isFormData) {
      headers.delete('Content-Type');
    }
  
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : '';
    console.log('📤 authFetch - Making request to:', url);
    console.log('📤 authFetch - Headers:', Object.fromEntries(headers.entries()));
  
    return fetch(input, { ...init, headers });
  } catch (err) {
    console.error('❌ Exception in authFetch:', err);
    throw err;
  }
}


