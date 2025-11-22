'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';

export default function AuthButton({ submitLabel = '發送驗證碼' }: { submitLabel?: string }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
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

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setInfo(null);
    setCodeSent(false);
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }
      
      setCodeSent(true);
      setInfo(language === 'zh-TW' 
        ? '驗證碼已發送至您的信箱，請輸入 6 位數驗證碼' 
        : language === 'ja'
        ? '確認コードがメールに送信されました。6桁の確認コードを入力してください'
        : 'Verification code sent to your email. Please enter the 6-digit code');
      
      // In development, show the code for testing
      if (process.env.NODE_ENV === 'development' && data.code) {
        console.log('🔐 Verification code (dev only):', data.code);
        setInfo((prev) => prev + ` (開發模式：驗證碼 ${data.code})`);
      }
    } catch (err: any) {
      setError(err?.message || (language === 'zh-TW' ? '發送驗證碼失敗' : language === 'ja' ? '確認コードの送信に失敗しました' : 'Failed to send verification code'));
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    setInfo(null);
    try {
      // Verify code via our API
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(),
          code: code.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // After server-side verification, sign in using the token
      if (data.token && data.type) {
        const { data: authData, error: authError } = await supabaseBrowser.auth.verifyOtp({
          email: email.trim(),
          token: data.token,
          type: data.type as any,
        });

        if (authError) {
          throw authError;
        }

        if (authData.session) {
          setInfo(language === 'zh-TW' ? '登入成功！' : language === 'ja' ? 'ログイン成功！' : 'Login successful!');
          setCodeSent(false);
          setCode('');
          setEmail('');
          // Auth state change will update userEmail automatically
        }
      } else {
        throw new Error('Failed to create session');
      }
    } catch (err: any) {
      setError(err?.message || (language === 'zh-TW' ? '驗證碼錯誤，請重試' : language === 'ja' ? '確認コードが正しくありません。もう一度お試しください' : 'Invalid verification code. Please try again'));
    } finally {
      setVerifying(false);
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

  if (!codeSent) {
    // Step 1: Enter email and send code
    return (
      <div className="space-y-4">
        <form onSubmit={sendCode} className="flex flex-col sm:flex-row gap-2">
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

  // Step 2: Enter verification code
  return (
    <div className="space-y-4">
      <div className="text-sm text-wood-600">
        {language === 'zh-TW' 
          ? `驗證碼已發送至：${email}`
          : language === 'ja'
          ? `確認コードを送信しました：${email}`
          : `Code sent to: ${email}`}
      </div>
      <form onSubmit={verifyCode} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder={language === 'zh-TW' ? '輸入 6 位數驗證碼' : language === 'ja' ? '6桁の確認コードを入力' : 'Enter 6-digit code'}
          value={code}
          onChange={(e) => {
            // Only allow numbers
            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
            setCode(value);
          }}
          required
          className="input-field flex-1 text-center text-2xl tracking-widest font-mono"
          disabled={verifying}
          autoFocus
        />
        <button type="submit" disabled={verifying || code.length !== 6} className="btn-primary disabled:opacity-50 whitespace-nowrap">
          {verifying 
            ? (language === 'zh-TW' ? '驗證中...' : language === 'ja' ? '確認中...' : 'Verifying...')
            : (language === 'zh-TW' ? '確認登入' : language === 'ja' ? 'ログイン確認' : 'Verify & Login')}
        </button>
      </form>
      <div className="flex items-center justify-between text-sm">
        <button
          onClick={() => {
            setCodeSent(false);
            setCode('');
            setError(null);
            setInfo(null);
          }}
          className="text-wood-600 hover:text-wood-800 underline"
        >
          {language === 'zh-TW' ? '重新發送驗證碼' : language === 'ja' ? '確認コードを再送信' : 'Resend Code'}
        </button>
        <button
          onClick={() => {
            setCodeSent(false);
            setCode('');
            setEmail('');
            setError(null);
            setInfo(null);
          }}
          className="text-wood-600 hover:text-wood-800 underline"
        >
          {language === 'zh-TW' ? '更改 Email' : language === 'ja' ? 'メールアドレスを変更' : 'Change Email'}
        </button>
      </div>
      {info && <p className="text-sm text-green-600">{info}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}


