'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';

// Force dynamic rendering for this page (uses searchParams)
export const dynamic = 'force-dynamic';

/**
 * This page listens for auth sync messages from browser tabs
 * When user logs in via email link in browser, this page in PWA
 * can receive the session and sync it
 */
export default function AuthSyncPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we're in a PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const inPWA = isStandalone || isIOSStandalone;

    if (!inPWA) {
      // Not in PWA, redirect
      router.push('/');
      return;
    }

    // Listen for auth sync messages
    const channel = new BroadcastChannel('insightbox-auth');
    
    channel.onmessage = async (event) => {
      if (event.data.type === 'AUTH_SUCCESS' && event.data.session) {
        try {
          // Set the session in PWA
          const { error } = await supabaseBrowser.auth.setSession({
            access_token: event.data.session.access_token,
            refresh_token: event.data.session.refresh_token,
          });

          if (!error) {
            // Successfully synced, redirect
            const next = searchParams.get('next') || '/';
            router.push(next);
          }
        } catch (err) {
          console.error('Failed to sync session:', err);
        }
      }
    };

    // Also check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (session) {
        const next = searchParams.get('next') || '/';
        router.push(next);
      }
    };

    checkSession();

    return () => {
      channel.close();
    };
  }, [router, searchParams]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="inline-block w-8 h-8 border-4 border-wood-300 border-t-accent rounded-full animate-spin mb-4"></div>
      <p className="text-wood-600">正在同步登入狀態...</p>
    </div>
  );
}

