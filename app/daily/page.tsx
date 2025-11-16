'use client';

import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { imageStyles } from '@/lib/utils/imageStyles';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';

type Inspiration = {
  id: string;
  date: string;
  content_json: {
    title?: string;
    message?: string;
    song?: { title?: string; artist?: string; youtube_url?: string; reason?: string };
  };
};

export default function DailyPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [inspiration, setInspiration] = useState<Inspiration | null>(null);
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() || 'en');
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const t = getTranslation(language);

  useEffect(() => {
    fetchToday();

    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  async function fetchToday() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/daily', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setInspiration(data.inspiration);
      } else {
        setInspiration(null);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load today\'s inspiration');
    } finally {
      setLoading(false);
    }
  }

  async function generateToday() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/daily', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate');
      }
      const data = await res.json();
      setInspiration(data.inspiration);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to generate');
    } finally {
      setGenerating(false);
    }
  }

  async function downloadImage() {
    if (!imageRef.current || !inspiration) return;
    try {
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      if (document.fonts) {
        await document.fonts.ready;
      }

      const bgColor = '#d4c4a8';
      const dataUrl = await toPng(imageRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: bgColor,
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `daily-inspiration-${inspiration.date}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('download image error', e);
      alert('Failed to generate image');
    }
  }

  const style = imageStyles['wooden'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-wood-800">
          Daily Inspiration
        </h1>
        <div className="flex gap-2">
          <button
            onClick={fetchToday}
            className="btn-secondary"
            disabled={loading}
          >
            Refresh
          </button>
          <button
            onClick={generateToday}
            className="btn-primary disabled:opacity-50"
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Today’s Inspiration'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-wood-600">Loading...</div>
      ) : inspiration ? (
        <div className="card">
          <div className="mb-4 text-sm text-wood-600">
            Date: {inspiration.date}
          </div>

          {/* Wooden Preview (re-using wooden style) */}
          <div className="flex justify-center mb-6">
            <div
              ref={imageRef}
              className="relative rounded-lg shadow-2xl overflow-hidden"
              style={{
                width: '540px',
                height: '675px',
                backgroundImage: style.background,
                aspectRatio: '4/5',
                boxSizing: 'border-box',
              }}
            >
              <div
                className="absolute border-4 rounded-lg"
                style={{ inset: '1rem', borderColor: style.borderColor }}
              />

              <div
                className="absolute flex flex-col items-center text-center"
                style={{ inset: '2rem', width: 'calc(100% - 4rem)' }}
              >
                <div
                  className="text-6xl mb-4 opacity-30"
                  style={{ color: style.textColor }}
                  dangerouslySetInnerHTML={{ __html: style.quoteIcon }}
                />

                <p
                  className="font-serif leading-relaxed mb-4 px-4"
                  style={{
                    color: style.textColor,
                    fontFamily:
                      language === 'zh-TW'
                        ? 'var(--font-noto-sans-tc), "Microsoft JhengHei", "PingFang TC", sans-serif'
                        : language === 'ja'
                        ? 'var(--font-noto-sans-jp), "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif'
                        : 'Georgia, serif',
                    fontSize:
                      language === 'zh-TW' || language === 'ja'
                        ? 'clamp(1.25rem, 3.8vw, 1.8rem)'
                        : 'clamp(1.1rem, 3.2vw, 1.6rem)',
                    lineHeight: '1.6',
                    maxHeight: '54%',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 8,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {inspiration.content_json?.message || ''}
                </p>

                <p
                  className="font-serif font-semibold mb-3 px-4"
                  style={{
                    color: style.titleColor,
                    fontFamily:
                      language === 'zh-TW'
                        ? 'var(--font-noto-sans-tc), "Microsoft JhengHei", "PingFang TC", sans-serif'
                        : language === 'ja'
                        ? 'var(--font-noto-sans-jp), "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif'
                        : 'Georgia, serif',
                    fontSize: 'clamp(1rem, 2.3vw, 1.3rem)',
                    maxWidth: '90%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {inspiration.content_json?.title || 'Daily Inspiration'}
                </p>

                <div
                  className="w-24 h-1 mb-3"
                  style={{ backgroundColor: style.decorativeLine }}
                />

                {inspiration.content_json?.song && (
                  <div
                    className="text-sm"
                    style={{ color: style.textColor, opacity: 0.85 }}
                  >
                    <div>
                      🎵 {inspiration.content_json.song.title} —{' '}
                      {inspiration.content_json.song.artist}
                      {inspiration.content_json.song.youtube_url && (
                        <>
                          {' '}
                          ·{' '}
                          <a
                            href={inspiration.content_json.song.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            YouTube
                          </a>
                        </>
                      )}
                    </div>
                    {inspiration.content_json.song.reason && (
                      <div className="opacity-80 mt-1 px-6">
                        {inspiration.content_json.song.reason}
                      </div>
                    )}
                  </div>
                )}

                <div className="absolute bottom-6 left-0 right-0 text-center">
                  <button
                    onClick={downloadImage}
                    className="btn-primary"
                  >
                    Download Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <p className="text-wood-700 mb-4">
            No inspiration generated for today.
          </p>
          <button
            onClick={generateToday}
            className="btn-primary disabled:opacity-50"
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Today’s Inspiration'}
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
          {error}
        </div>
      )}
    </div>
  );
}


