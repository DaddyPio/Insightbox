'use client';

import { useEffect, useState } from 'react';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';

export default function Footer() {
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() || 'en');
  const t = getTranslation(language);

  useEffect(() => {
    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  return (
    <footer className="bg-wood-50 border-t border-wood-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center text-sm text-wood-600">
          {t.footerCopyright}
        </div>
      </div>
    </footer>
  );
}

