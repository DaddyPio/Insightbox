'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInPWA, setIsInPWA] = useState(false);
  const [showBackToApp, setShowBackToApp] = useState(false);

  useEffect(() => {
    // Check if we're in a PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const inPWA = isStandalone || isIOSStandalone;
    setIsInPWA(inPWA);

    // If we're in browser but PWA is installed, show back to app button
    if (!inPWA) {
      // Check if PWA might be installed (on iOS, we can't detect this easily)
      // For now, always show the option on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        setShowBackToApp(true);
      }
    }

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
            if (inPWA) {
              // We're in PWA, redirect to home
              const next = searchParams.get('next') || '/';
              router.push(next);
            } else {
              // We're in browser
              // Store session and redirect
              const next = searchParams.get('next') || '/';
              
              // Try to open in PWA if possible (iOS)
              // For iOS, we can try to use a custom URL scheme or just redirect
              // For now, redirect to the app URL which should open in PWA if installed
              window.location.href = next;
            }
          }
        } else {
          // No tokens in hash, might be using code flow
          // Try to get session from Supabase
          const { data: { session } } = await supabaseBrowser.auth.getSession();
          
          if (session) {
            const next = searchParams.get('next') || '/';
            if (inPWA) {
              router.push(next);
            } else {
              window.location.href = next;
            }
          } else {
            // Wait a bit for the server-side callback to complete
            setTimeout(async () => {
              const { data: { session: newSession } } = await supabaseBrowser.auth.getSession();
              if (newSession) {
                const next = searchParams.get('next') || '/';
                if (inPWA) {
                  router.push(next);
                } else {
                  window.location.href = next;
                }
              } else {
                setError('無法完成登入，請重試');
                setLoading(false);
              }
            }, 2000);
          }
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err?.message || 'Authentication failed');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">登入失敗</h1>
        <p className="text-wood-600 mb-4">{error}</p>
        <Link href="/login" className="btn-primary mt-4 inline-block">
          返回登入頁面
        </Link>
      </div>
    );
  }

  if (showBackToApp && !isInPWA) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="card">
          <h1 className="text-2xl font-bold text-wood-800 mb-4">登入成功！</h1>
          <p className="text-wood-600 mb-6">
            您已在瀏覽器中完成登入。請返回 InsightBox 應用繼續使用。
          </p>
          <div className="space-y-3">
            <Link href="/" className="btn-primary block">
              繼續使用
            </Link>
            <p className="text-sm text-wood-500">
              提示：如果已安裝 InsightBox 應用，請關閉此頁面並在應用中繼續使用。
            </p>
          </div>
        </div>
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

