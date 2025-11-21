'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from URL (Supabase auth callback)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (error) {
          setError(errorDescription || error);
          setLoading(false);
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session
          const { data, error: sessionError } = await supabaseBrowser.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }

          if (data.session) {
            // Successfully authenticated
            // Check if we're in a PWA (standalone mode)
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const isIOSStandalone = (window.navigator as any).standalone === true;
            
            if (isStandalone || isIOSStandalone) {
              // We're in PWA, redirect to home
              router.push('/');
            } else {
              // We're in browser, check if we should redirect to PWA
              // For now, just redirect to home
              const next = searchParams.get('next') || '/';
              router.push(next);
            }
          }
        } else {
          // No tokens in hash, might be using code flow
          // Try to get session from Supabase
          const { data: { session } } = await supabaseBrowser.auth.getSession();
          
          if (session) {
            const next = searchParams.get('next') || '/';
            router.push(next);
          } else {
            // Wait a bit for the server-side callback to complete
            setTimeout(() => {
              router.push('/');
            }, 1000);
          }
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err?.message || 'Authentication failed');
        setLoading(false);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">登入失敗</h1>
        <p className="text-wood-600 mb-4">{error}</p>
        <p className="text-sm text-wood-500">正在返回登入頁面...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="inline-block w-8 h-8 border-4 border-wood-300 border-t-accent rounded-full animate-spin mb-4"></div>
      <p className="text-wood-600">正在完成登入...</p>
    </div>
  );
}

