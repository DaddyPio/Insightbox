'use client';

import { useEffect, useState } from 'react';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';

export default function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() || 'en');

  useEffect(() => {
    const storedLang = getStoredLanguage();
    if (storedLang) {
      setLanguage(storedLang);
    }

    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);

    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const installed = isStandalone || isIOSStandalone;
      setIsInstalled(installed);
      if (installed) {
        console.log('App is already installed');
        return;
      }
    };

    checkInstalled();

    // Register service worker immediately
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      const registerSW = async () => {
        try {
          // Unregister any existing service workers first
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            if (registration.scope !== window.location.origin + '/') {
              await registration.unregister();
            }
          }

          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
          console.log('✅ Service Worker registered:', registration.scope);
          setSwRegistered(true);

          // Wait a bit for service worker to be ready
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New service worker available');
                }
              });
            }
          });
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
          setSwRegistered(false);
        }
      };

      // Register immediately
      registerSW();

      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    } else {
      console.log('⚠️ Service Worker not supported');
    }

    // Listen for beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('✅ beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay to ensure page is loaded
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also show manual install option after checking conditions
    const checkAndShowPrompt = () => {
      if (isInstalled) return;
      
      // Wait for service worker to register, then show prompt
      setTimeout(() => {
        // If beforeinstallprompt didn't fire, still show manual install option
        if (!deferredPrompt && swRegistered) {
          console.log('ℹ️ Showing manual install option');
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    checkAndShowPrompt();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('languageChanged', onLang);
    };
  }, [swRegistered, isInstalled, deferredPrompt]);

  const t = getTranslation(language);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error('Error showing install prompt:', error);
        showManualInstructions();
      }
    } else {
      showManualInstructions();
    }
  };

  const showManualInstructions = () => {
    const t = getTranslation(language);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = '';
    if (isIOS) {
      instructions = language === 'zh-TW'
        ? 'iOS 安裝步驟：\n1. 點擊瀏覽器底部的「分享」按鈕\n2. 向下滾動找到「加入主畫面」\n3. 點擊「加入主畫面」完成安裝'
        : language === 'ja'
        ? 'iOS インストール手順：\n1. ブラウザ下部の「共有」ボタンをタップ\n2. 下にスクロールして「ホーム画面に追加」を見つける\n3. 「ホーム画面に追加」をタップしてインストールを完了'
        : 'iOS Installation:\n1. Tap the "Share" button at the bottom\n2. Scroll down to find "Add to Home Screen"\n3. Tap "Add to Home Screen" to complete';
    } else if (isAndroid) {
      instructions = language === 'zh-TW'
        ? 'Android 安裝步驟：\n1. 點擊瀏覽器右上角的「選單」（三個點）\n2. 選擇「加入主畫面」或「安裝應用」\n3. 確認安裝'
        : language === 'ja'
        ? 'Android インストール手順：\n1. ブラウザ右上の「メニュー」（3つの点）をタップ\n2. 「ホーム画面に追加」または「アプリをインストール」を選択\n3. インストールを確認'
        : 'Android Installation:\n1. Tap the menu (three dots) in the top right\n2. Select "Add to Home Screen" or "Install App"\n3. Confirm installation';
    } else {
      instructions = t.installAppDescription;
    }
    
    alert(instructions);
  };

  // Don't show if already installed
  if (isInstalled) return null;

  // Show prompt after a delay to ensure everything is ready
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

