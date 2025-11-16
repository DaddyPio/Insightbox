'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';

export default function AuthButton() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const { error } = await supabaseBrowser.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      setInfo('登入連結已寄出，請到信箱點擊連結完成登入');
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

  const oauthSignin = async (provider: 'google' | 'github') => {
    setError(null);
    try {
      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          skipBrowserRedirect: false,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err?.message || 'OAuth signin failed');
    }
  };

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
          {sending ? '寄送中...' : '登入連結'}
        </button>
      </form>
      <button
        onClick={() => oauthSignin('google')}
        className="btn-secondary"
        title="使用 Google 登入"
      >
        Google
      </button>
      <button
        onClick={() => oauthSignin('github')}
        className="btn-secondary"
        title="使用 GitHub 登入"
      >
        GitHub
      </button>
      {info && <span className="text-xs text-wood-600">{info}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}


