'use client';

import { useEffect, useState } from 'react';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';

export default function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() || 'en');

  useEffect(() => {
    const storedLang = getStoredLanguage();
    if (storedLang) {
      setLanguage(storedLang);
    }

    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);

    // Register service worker immediately
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
          console.log('Service Worker registered:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('New service worker available');
                }
              });
            }
          });
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      };

      // Register immediately if page is already loaded, otherwise wait for load
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }

      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }

    // Listen for beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('languageChanged', onLang);
    };
  }, []);

  const t = getTranslation(language);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback: show manual installation instructions
      const instructions = 
        language === 'zh-TW' 
          ? '請使用瀏覽器選單中的「加入主畫面」功能來安裝此應用。'
          : language === 'ja'
          ? 'ブラウザメニューの「ホーム画面に追加」機能を使用してアプリをインストールしてください。'
          : 'Please use the browser menu to "Add to Home Screen" to install this app.';
      alert(instructions);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-wood-800 text-white p-4 rounded-lg shadow-lg flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold text-sm">{t.installAppTitle}</p>
          <p className="text-xs text-wood-200 mt-1">
            {t.installAppDescription}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="px-3 py-1 text-sm text-wood-200 hover:text-white"
          >
            {t.later}
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-1 bg-accent hover:bg-accent-dark text-white rounded text-sm font-medium"
          >
            {t.install}
          </button>
        </div>
      </div>
    </div>
  );
}

