import { supabaseBrowser } from '@/lib/supabase/browser';

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const { data } = await supabaseBrowser.auth.getSession();
  const token = data.session?.access_token;
  
  // Don't override headers if body is FormData (browser sets Content-Type automatically)
  const isFormData = init.body instanceof FormData;
  const headers = isFormData 
    ? new Headers(init.headers || {})
    : new Headers(init.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Remove Content-Type for FormData to let browser set it with boundary
  if (isFormData) {
    headers.delete('Content-Type');
  }
  
  return fetch(input, { ...init, headers });
}


