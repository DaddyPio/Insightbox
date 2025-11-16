/**
 * Language context utilities using localStorage
 */

import type { AppLanguage } from './translations';

const LANGUAGE_STORAGE_KEY = 'insightbox-language';

export function getStoredLanguage(): AppLanguage | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && (stored === 'zh-TW' || stored === 'en' || stored === 'ja')) {
    return stored as AppLanguage;
  }
  return null;
}

export function setStoredLanguage(lang: AppLanguage): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

