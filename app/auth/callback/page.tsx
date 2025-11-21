'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';
import Link from 'next/link';

// Force dynamic rendering for this page (uses searchParams)
export const dynamic = 'force-dynamic';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInPWA, setIsInPWA] = useState(false);
  const [sessionSet, setSessionSet] = useState(false);

  useEffect(() => {
    // Check if we're in a PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const inPWA = isStandalone || isIOSStandalone;
    setIsInPWA(inPWA);

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
          // Set the session in this browser context
          const { data, error: sessionError } = await supabaseBrowser.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }

          if (data.session) {
            setSessionSet(true);
            
            // Try to broadcast session to PWA using BroadcastChannel
            // This allows PWA to receive the session if it's open
            try {
              const channel = new BroadcastChannel('insightbox-auth');
              channel.postMessage({
                type: 'AUTH_SUCCESS',
                session: {
                  access_token: accessToken,
                  refresh_token: refreshToken,
                },
                timestamp: Date.now(),
              });
              
              // Keep channel open briefly to ensure message is sent
              setTimeout(() => {
                channel.close();
              }, 1000);
            } catch (e) {
              console.log('BroadcastChannel not supported:', e);
            }

            // Also try to store in a way that PWA can access
            // Note: localStorage is separate between browser and PWA on iOS
            // But we can try to use sessionStorage or other methods
            try {
              // Store a flag that PWA can check
              sessionStorage.setItem('insightbox-auth-pending', 'true');
              sessionStorage.setItem('insightbox-auth-token', accessToken);
              sessionStorage.setItem('insightbox-auth-refresh', refreshToken);
            } catch (e) {
              console.log('Failed to store auth in sessionStorage:', e);
            }

            // If we're in PWA, just redirect
            if (inPWA) {
              const next = searchParams.get('next') || '/';
              router.push(next);
              return;
            }

            // We're in browser - try to open PWA
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            const isAndroid = /Android/i.test(navigator.userAgent);
            const next = searchParams.get('next') || '/';
            const appUrl = window.location.origin + next;

            if (isIOS) {
              // For iOS, try to open the app URL which might trigger PWA
              // Also show a message to manually switch
              setTimeout(() => {
                // Try to open in PWA (might work if PWA is installed)
                window.location.href = appUrl;
              }, 500);
            } else if (isAndroid) {
              // For Android, try to open in PWA
              window.location.href = appUrl;
            } else {
              // Desktop - just redirect
              router.push(next);
            }
          }
        } else {
          // No tokens in hash, check for code in query params
          const code = searchParams.get('code');
          if (code) {
            // Code flow - wait for server-side callback
            setTimeout(async () => {
              const { data: { session } } = await supabaseBrowser.auth.getSession();
              if (session) {
                setSessionSet(true);
                const next = searchParams.get('next') || '/';
                if (inPWA) {
                  router.push(next);
                } else {
                  window.location.href = window.location.origin + next;
                }
              } else {
                setError('無法完成登入，請重試');
                setLoading(false);
              }
            }, 2000);
          } else {
            // Try to get existing session
            const { data: { session } } = await supabaseBrowser.auth.getSession();
            if (session) {
              setSessionSet(true);
              const next = searchParams.get('next') || '/';
              if (inPWA) {
                router.push(next);
              } else {
                window.location.href = window.location.origin + next;
              }
            } else {
              setError('無法完成登入，請檢查登入連結是否正確');
              setLoading(false);
            }
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

  // Listen for auth state changes in PWA
  useEffect(() => {
    if (isInPWA) {
      const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const next = searchParams.get('next') || '/';
          router.push(next);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isInPWA, router, searchParams]);

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

  // Show success message if session is set but we're in browser
  if (sessionSet && !isInPWA) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const appUrl = window.location.origin;
    
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="card">
          <h1 className="text-2xl font-bold text-wood-800 mb-4">✅ 登入成功！</h1>
          {isMobile ? (
            <>
              <p className="text-wood-600 mb-4">
                您已在瀏覽器中完成登入。
              </p>
              {isIOS ? (
                <>
                  <p className="text-wood-600 mb-4">
                    由於 iOS 的限制，登入狀態無法自動同步到已安裝的應用。
                  </p>
                  <p className="text-wood-600 mb-6">
                    <strong>請按照以下步驟操作：</strong>
                  </p>
                  <div className="text-left bg-wood-50 p-4 rounded-lg mb-6">
                    <ol className="list-decimal list-inside space-y-2 text-wood-700">
                      <li>關閉此瀏覽器頁面</li>
                      <li>返回 InsightBox 應用（從主畫面打開）</li>
                      <li>在應用中重新輸入 email 並點擊登入連結</li>
                      <li>這次請在應用中直接點擊 email 連結（不要從郵件 app 打開）</li>
                    </ol>
                  </div>
                  <p className="text-sm text-wood-500 mb-4">
                    或者，您也可以繼續在瀏覽器中使用。
                  </p>
                  <div className="space-y-2">
                    <Link href="/" className="btn-primary block">
                      繼續使用（在瀏覽器中）
                    </Link>
                    <button
                      onClick={() => {
                        // Try to open the app URL - might trigger PWA on iOS
                        window.location.href = appUrl;
                      }}
                      className="btn-secondary block w-full"
                    >
                      嘗試打開應用
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-wood-600 mb-6">
                    請關閉此瀏覽器頁面，返回 InsightBox 應用繼續使用。
                  </p>
                  <p className="text-sm text-wood-500 mb-4">
                    提示：登入狀態已保存，當您返回應用時會自動同步。
                  </p>
                  <div className="space-y-2">
                    <Link href="/" className="btn-primary block">
                      繼續使用（在瀏覽器中）
                    </Link>
                    <button
                      onClick={() => {
                        window.location.href = appUrl;
                      }}
                      className="btn-secondary block w-full"
                    >
                      打開應用
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <p className="text-wood-600 mb-6">登入成功！</p>
              <Link href="/" className="btn-primary block">
                繼續使用
              </Link>
            </>
          )}
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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-wood-300 border-t-accent rounded-full animate-spin mb-4"></div>
        <p className="text-wood-600">正在載入...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

