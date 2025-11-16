'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SpeechToTextButton from '@/components/SpeechToTextButton';
import { getStoredLanguage, setStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';

export default function Home() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<AppLanguage>('en');
  const router = useRouter();

  useEffect(() => {
    // Load language from localStorage or default to 'en'
    const storedLang = getStoredLanguage();
    if (storedLang) {
      setLanguage(storedLang);
    }
  }, []);

  const handleLanguageChange = (lang: AppLanguage) => {
    setLanguage(lang);
    setStoredLanguage(lang);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('languageChanged'));
  };

  const t = getTranslation(language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError(t.yourNote);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { authFetch } = await import('@/lib/utils/authFetch');
      const response = await authFetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        // Show detailed error message if available
        const errorMsg = data.message || data.error || 'Failed to create note';
        const errorDetails = data.details ? `\n\nDetails: ${data.details}` : '';
        const errorHint = data.hint ? `\n\nHint: ${data.hint}` : '';
        throw new Error(errorMsg + errorDetails + errorHint);
      }

      const data = await response.json();
      
      // Redirect to the new note
      router.push(`/card/${data.note.id}`);
    } catch (err) {
      console.error('Error creating note:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create note';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTranscription = (text: string) => {
    setContent(prev => prev + (prev ? ' ' : '') + text);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Language Selector */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-wood-700">
            {language === 'zh-TW' ? '語言' : language === 'ja' ? '言語' : 'Language'}:
          </label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as AppLanguage)}
            className="px-3 py-1 border border-wood-300 rounded-lg bg-white text-wood-700 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="zh-TW">中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-wood-800 mb-4">
          {t.homeTitle}
        </h1>
        <p className="text-wood-600 text-lg">
          {t.homeSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-wood-700 mb-2">
            {t.yourNote}
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.placeholder}
            rows={8}
            className="input-field resize-none"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg whitespace-pre-wrap">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <SpeechToTextButton 
            onTranscription={handleTranscription}
            disabled={isSubmitting}
          />
          
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{t.processing}</span>
              </span>
            ) : (
              t.saveNote
            )}
          </button>
        </div>
      </form>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-6 bg-wood-100 rounded-lg">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-semibold text-wood-800 mb-2">AI-Powered</h3>
          <p className="text-sm text-wood-600">
            Automatic title, tags, and insights
          </p>
        </div>
        <div className="p-6 bg-wood-100 rounded-lg">
          <div className="text-3xl mb-2">🎤</div>
          <h3 className="font-semibold text-wood-800 mb-2">Voice Input</h3>
          <p className="text-sm text-wood-600">
            Speak your thoughts naturally
          </p>
        </div>
        <div className="p-6 bg-wood-100 rounded-lg">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-wood-800 mb-2">Weekly Insights</h3>
          <p className="text-sm text-wood-600">
            Discover patterns in your thoughts
          </p>
        </div>
      </div>

      <footer className="mt-12 text-center text-wood-500">
        {t.footerCopyright}
      </footer>
    </div>
  );
}

