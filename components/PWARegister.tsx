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
        console.log('✅ App is already installed');
        return true;
      }
      return false;
    };

    const alreadyInstalled = checkInstalled();
    if (alreadyInstalled) {
      return () => {
        window.removeEventListener('languageChanged', onLang);
      };
    }

    // Check if user dismissed the prompt recently (within 24 hours)
    // But still register service worker and listen for events
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    let shouldShowPrompt = true;
    if (dismissedTime) {
      const hoursSinceDismissal = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissal < 24) {
        console.log('ℹ️ Install prompt was dismissed recently, will not show automatically');
        shouldShowPrompt = false;
      } else {
        localStorage.removeItem('pwa-install-dismissed');
      }
    }

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
          
          // Wait for service worker to be ready (longer on mobile)
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const waitTime = isMobile ? 2000 : 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Check if service worker is actually active
          if (registration.active) {
            console.log('✅ Service Worker is active');
            setSwRegistered(true);
          } else if (registration.installing) {
            console.log('⏳ Service Worker is installing...');
            registration.installing.addEventListener('statechange', () => {
              if (registration.installing?.state === 'activated') {
                console.log('✅ Service Worker activated');
                setSwRegistered(true);
              }
            });
          } else if (registration.waiting) {
            console.log('✅ Service Worker is waiting (already installed)');
            setSwRegistered(true);
          } else {
            console.log('⚠️ Service Worker registration state unclear, assuming registered');
            setSwRegistered(true);
          }

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
      console.log('✅ beforeinstallprompt event fired in Chrome');
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay to ensure page is loaded
      if (shouldShowPrompt) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also check periodically if beforeinstallprompt should have fired
    // Sometimes Chrome delays this event
    const checkInterval = setInterval(() => {
      if (!deferredPrompt && !isInstalled && shouldShowPrompt) {
        // Check if we can detect installability
        console.log('ℹ️ Checking PWA installability...');
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('languageChanged', onLang);
      clearInterval(checkInterval);
    };
  }, []);

  // Separate effect to show prompt after conditions are met
  useEffect(() => {
    if (isInstalled) {
      console.log('ℹ️ App already installed, not showing prompt');
      return;
    }

    // Check if prompt was dismissed
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const hoursSinceDismissal = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissal < 24) {
        console.log('ℹ️ Install prompt was dismissed recently, not showing');
        return;
      }
    }

    // Detect if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    // Mobile devices may need more time for service worker registration
    const delay = isMobile ? 5000 : 3000;
    
    console.log(`ℹ️ Device detected: ${isMobile ? 'Mobile' : 'Desktop'}, will show prompt after ${delay}ms`);
    
    // Wait for service worker to register, then show prompt
    const timer = setTimeout(() => {
      console.log('ℹ️ Checking install prompt conditions:', {
        swRegistered,
        hasDeferredPrompt: !!deferredPrompt,
        isInstalled,
        isMobile,
        userAgent: navigator.userAgent.substring(0, 100) // Truncate for readability
      });
      
      // Always show install option after delay (for manual install)
      // This ensures users can install even if beforeinstallprompt doesn't fire
      // Especially important for Chrome on mobile
      console.log('ℹ️ Showing install prompt (will show for all browsers)');
      setShowInstallPrompt(true);
    }, delay);

    return () => clearTimeout(timer);
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
  if (isInstalled) {
    return null;
  }

  // Show prompt after a delay to ensure everything is ready
  if (!showInstallPrompt) {
    return null;
  }

  // Detect mobile for styling
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[9999] md:bottom-4 md:left-auto md:right-4 md:w-96 animate-slide-up"
      style={{
        // Ensure it's visible on mobile
        position: 'fixed',
        zIndex: 9999,
        ...(isMobile && {
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
        })
      }}
    >
      <div className="bg-wood-800 text-white p-4 rounded-lg shadow-xl border-2 border-wood-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold text-base mb-1">{t.installAppTitle}</p>
          <p className="text-sm text-wood-200">
            {t.installAppDescription}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setShowInstallPrompt(false);
              // Store dismissal in localStorage to not show again for 24 hours
              localStorage.setItem('pwa-install-dismissed', Date.now().toString());
            }}
            className="px-4 py-2 text-sm text-wood-200 hover:text-white border border-wood-600 rounded transition-colors"
          >
            {t.later}
          </button>
          <button
            onClick={handleInstallClick}
            className="px-6 py-2 bg-accent hover:bg-accent-dark text-white rounded text-sm font-semibold shadow-lg transition-all hover:scale-105 flex-1 sm:flex-initial"
          >
            {t.install}
          </button>
        </div>
      </div>
    </div>
  );
}

