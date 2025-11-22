'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';

export default function AuthButton({ submitLabel = '發送登入連結' }: { submitLabel?: string }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() || 'en');

  const t = getTranslation(language);

  useEffect(() => {
    const storedLang = getStoredLanguage();
    if (storedLang) {
      setLanguage(storedLang);
    }

    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);

    const sync = async () => {
      const { data } = await supabaseBrowser.auth.getUser();
      setUserEmail(data.user?.email ?? null);
    };
    sync();
    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(() => {
      sync();
    });
    return () => {
      window.removeEventListener('languageChanged', onLang);
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setInfo(null);
    
    try {
      const emailRedirectTo = `${window.location.origin}/auth/callback`;
      
      const { error: signInError } = await supabaseBrowser.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo,
        },
      });

      if (signInError) {
        throw signInError;
      }

      setInfo(
        language === 'zh-TW' 
          ? '登入連結已發送至您的信箱，請點擊 email 中的連結完成登入' 
          : language === 'ja'
          ? 'ログインリンクがメールに送信されました。メール内のリンクをクリックしてログインを完了してください'
          : 'Login link sent to your email. Please click the link in your email to complete login'
      );
      setEmail('');
    } catch (err: any) {
      setError(err?.message || (language === 'zh-TW' ? '發送登入連結失敗' : language === 'ja' ? 'ログインリンクの送信に失敗しました' : 'Failed to send login link'));
    } finally {
      setSending(false);
    }
  };

  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
    setUserEmail(null);
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
    <div className="space-y-4">
      <form onSubmit={signIn} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder={language === 'zh-TW' ? '輸入 Email' : language === 'ja' ? 'メールアドレスを入力' : 'Enter Email'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field flex-1"
          disabled={sending}
        />
        <button type="submit" disabled={sending} className="btn-primary disabled:opacity-50 whitespace-nowrap">
          {sending 
            ? (language === 'zh-TW' ? '發送中...' : language === 'ja' ? '送信中...' : 'Sending...')
            : submitLabel}
        </button>
      </form>
      {info && <p className="text-sm text-wood-600">{info}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}


