'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';

export default function AuthButton({ submitLabel = '登入連結' }: { submitLabel?: string }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loginLink, setLoginLink] = useState<string | null>(null);

  useEffect(() => {
    const sync = async () => {
      const { data } = await supabaseBrowser.auth.getUser();
      setUserEmail(data.user?.email ?? null);
    };
    sync();
    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(() => {
      sync();
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setInfo(null);
    try {
      // Detect if we're in a PWA (standalone mode)
      const isStandalone = typeof window !== 'undefined' && (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      );

      // Get the current origin
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Use auth callback page for better PWA support
      // The callback page will handle redirecting back to the app
      // Include a sync page parameter for PWA to listen
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(currentPath)}`;

      const { data, error } = await supabaseBrowser.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      
      if (error) throw error;
      
      // If in PWA, store the redirect URL so user can copy it
      if (isStandalone && data) {
        // Store the redirect URL for copying
        setLoginLink(redirectTo);
        setInfo('登入連結已寄出！請查看 email。如果連結在瀏覽器中打開，請複製連結並在應用中打開。');
      } else {
        setInfo('登入連結已寄出，請到信箱點擊連結完成登入');
      }
      setEmail('');
    } catch (err: any) {
      setError(err?.message || 'Failed to send login link');
    } finally {
      setSending(false);
    }
  };

  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
    setUserEmail(null);
  };

  // OAuth 登入暫時停用（保留程式碼以便未來啟用）

  if (userEmail) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-wood-700 hidden sm:inline">已登入：{userEmail}</span>
        <button onClick={signOut} className="btn-secondary">登出</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <form onSubmit={signIn} className="flex items-center gap-2">
        <input
          type="email"
          placeholder="輸入 Email 登入"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field w-44 sm:w-56"
        />
        <button type="submit" disabled={sending} className="btn-primary disabled:opacity-50">
          {sending ? '寄送中...' : submitLabel}
        </button>
      </form>
      {info && (
        <div className="text-xs text-wood-600 space-y-2">
          <p>{info}</p>
          {loginLink && (
            <div className="mt-2 p-2 bg-wood-50 rounded border border-wood-200">
              <p className="text-wood-700 mb-1 font-semibold">如果 email 連結在瀏覽器中打開：</p>
              <p className="text-wood-600 mb-2 text-xs">1. 複製下面的連結</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={loginLink}
                  className="flex-1 px-2 py-1 text-xs border border-wood-300 rounded bg-white"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(loginLink);
                    setInfo('連結已複製！請在應用中打開此連結。');
                  }}
                  className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-accent-dark"
                >
                  複製
                </button>
              </div>
              <p className="text-wood-600 mt-2 text-xs">2. 在 InsightBox 應用中，長按地址欄並貼上連結，然後打開</p>
            </div>
          )}
        </div>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}


