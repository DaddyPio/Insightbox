'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';

/**
 * Listens for auth sync messages from browser tabs
 * When user logs in via email link in browser, this component
 * in PWA can receive the session and sync it
 */
export default function AuthSyncListener() {
  const router = useRouter();

  useEffect(() => {
    // Only listen if we're in a PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const inPWA = isStandalone || isIOSStandalone;

    if (!inPWA) {
      return;
    }

    // Listen for auth sync messages via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    
    try {
      channel = new BroadcastChannel('insightbox-auth');
      
      channel.onmessage = async (event) => {
        if (event.data.type === 'AUTH_SUCCESS' && event.data.session) {
          try {
            console.log('📨 Received auth sync message in PWA');
            
            // Set the session in PWA
            const { error } = await supabaseBrowser.auth.setSession({
              access_token: event.data.session.access_token,
              refresh_token: event.data.session.refresh_token,
            });

            if (!error) {
              console.log('✅ Session synced to PWA successfully');
              // Optionally refresh the page or navigate
              // router.refresh();
            } else {
              console.error('❌ Failed to sync session:', error);
            }
          } catch (err) {
            console.error('Failed to sync session:', err);
          }
        }
      };
    } catch (e) {
      console.log('BroadcastChannel not supported:', e);
    }

    // Also periodically check for session changes
    // This helps catch cases where session was set in browser
    // and user switches back to PWA
    const checkInterval = setInterval(async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (session) {
        // Session exists, we're good
        return;
      }
      
      // No session, but check if there's a pending auth
      // (This won't work across browser/PWA boundary on iOS, but worth trying)
    }, 5000);

    return () => {
      if (channel) {
        channel.close();
      }
      clearInterval(checkInterval);
    };
  }, [router]);

  return null;
}

