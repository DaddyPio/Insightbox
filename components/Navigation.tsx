'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';
import { supabaseBrowser } from '@/lib/supabase/browser';

export default function Navigation() {
  const pathname = usePathname();
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedLang = getStoredLanguage();
    if (storedLang) {
      setLanguage(storedLang);
    }
  }, []);

  // Update language when localStorage changes (for same-tab updates)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedLang = getStoredLanguage();
      if (storedLang) {
        setLanguage(storedLang);
      }
    };

    // Listen for storage events (cross-tab)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom language change events (same-tab)
    window.addEventListener('languageChanged', handleStorageChange);
    
    // Also check periodically for same-tab changes
    const interval = setInterval(handleStorageChange, 200);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChanged', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const t = getTranslation(language);

  return (
    <nav className="bg-wood-100 border-b border-wood-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-serif font-bold text-wood-800">
              InsightBox
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4">
              <Link 
                href="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/' 
                    ? 'text-wood-900 bg-wood-200' 
                    : 'text-wood-700 hover:text-wood-900 hover:bg-wood-200'
                }`}
              >
                {t.navHome}
              </Link>
              <Link 
                href="/cards" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/cards' 
                    ? 'text-wood-900 bg-wood-200' 
                    : 'text-wood-700 hover:text-wood-900 hover:bg-wood-200'
                }`}
              >
                {t.navCards}
              </Link>
              <Link 
                href="/daily" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/daily' 
                    ? 'text-wood-900 bg-wood-200' 
                    : 'text-wood-700 hover:text-wood-900 hover:bg-wood-200'
                }`}
              >
                {t.navDaily}
              </Link>
              <Link 
                href="/weekly" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/weekly' 
                    ? 'text-wood-900 bg-wood-200' 
                    : 'text-wood-700 hover:text-wood-900 hover:bg-wood-200'
                }`}
              >
                {t.navWeeklyReview}
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-wood-700 hover:text-wood-900 p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop auth / user info */}
          <div className="hidden md:flex items-center gap-3">
            <UserInfo language={language} onMobileMenuClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === '/' 
                    ? 'text-wood-900 bg-wood-200' 
                    : 'text-wood-700 hover:text-wood-900 hover:bg-wood-200'
                }`}
              >
                {t.navHome}
              </Link>
              <Link 
                href="/cards" 
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === '/cards' 
                    ? 'text-wood-900 bg-wood-200' 
                    : 'text-wood-700 hover:text-wood-900 hover:bg-wood-200'
                }`}
              >
                {t.navCards}
              </Link>
              <Link 
                href="/daily" 
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === '/daily' 
                    ? 'text-wood-900 bg-wood-200' 
                    : 'text-wood-700 hover:text-wood-900 hover:bg-wood-200'
                }`}
              >
                Daily
              </Link>
              <Link 
                href="/weekly" 
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === '/weekly' 
                    ? 'text-wood-900 bg-wood-200' 
                    : 'text-wood-700 hover:text-wood-900 hover:bg-wood-200'
                }`}
              >
                {t.navWeeklyReview}
              </Link>

              <UserInfo mobile language={language} onMobileMenuClose={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// 使用者資訊顯示（顯示登入狀態、Email 和登出按鈕）
function UserInfo({ 
  mobile = false, 
  language,
  onMobileMenuClose 
}: { 
  mobile?: boolean; 
  language: AppLanguage;
  onMobileMenuClose?: () => void;
}) {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const t = getTranslation(language);

  useEffect(() => {
    // 從 Supabase 取得目前使用者 Email
    const sync = async () => {
      const { data } = await supabaseBrowser.auth.getUser();
      setEmail(data.user?.email ?? null);
      setLoading(false);
    };
    
    sync();
    
    // 監聽登入狀態變化
    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(() => {
      sync();
    });
    
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabaseBrowser.auth.signOut();
    setEmail(null);
  };

  if (loading) {
    return null; // 載入中不顯示任何內容
  }

  // 已登入：顯示 Email 和登出按鈕
  if (email) {
    if (mobile) {
      return (
        <>
          <div className="px-3 py-2 mx-3 my-1 rounded-lg bg-wood-50 text-wood-700 text-center text-sm">
            {t.loggedIn}：{email}
          </div>
          <button
            onClick={handleSignOut}
            className="px-3 py-2 mx-3 my-1 rounded-lg border border-wood-300 bg-wood-50 text-wood-700 text-center"
          >
            {t.logout}
          </button>
        </>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-wood-700">
          {t.loggedIn}：<span className="font-medium">{email}</span>
        </span>
        <button onClick={handleSignOut} className="btn-secondary">
          {t.logout}
        </button>
      </div>
    );
  }

  // 未登入：顯示註冊和登入按鈕
  if (mobile) {
    return (
      <>
        <Link 
          href="/signup" 
          onClick={onMobileMenuClose}
          className="px-3 py-2 mx-3 my-1 rounded-lg border border-wood-300 bg-wood-50 text-wood-700 text-center"
        >
          {t.register}
        </Link>
        <Link 
          href="/login" 
          onClick={onMobileMenuClose}
          className="px-3 py-2 mx-3 my-1 rounded-lg bg-accent text-white text-center"
        >
          {t.login}
        </Link>
      </>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/signup" className="btn-secondary">
        {t.register}
      </Link>
      <Link href="/login" className="btn-primary">
        {t.login}
      </Link>
    </div>
  );
}

