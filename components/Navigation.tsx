'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';
import dynamic from 'next/dynamic';

const AuthButton = dynamic(() => import('@/components/AuthButton'), { ssr: false });

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

          {/* Desktop auth + hint */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-xs text-wood-600">
              切換使用者：先登出，再使用新 Email 登入
            </div>
            <AuthButton />
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

              <div className="px-3 pt-2 text-xs text-wood-600">
                切換使用者：先登出，再使用新 Email 登入
              </div>
              <div className="px-3">
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

