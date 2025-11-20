'use client';

import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import Link from 'next/link';
import { imageStyles } from '@/lib/utils/imageStyles';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';
import { authFetch } from '@/lib/utils/authFetch';

type Inspiration = {
  id: string;
  date: string;
  content_json: {
    mentor_style?: string;
    themes?: string[];
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
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const t = getTranslation(language);

  useEffect(() => {
    fetchToday();

    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  // Check if current inspiration is favorited
  useEffect(() => {
    if (inspiration?.id) {
      // Reset to false first, then check
      setIsFavorited(false);
      checkFavoriteStatus();
    } else {
      setIsFavorited(false);
    }
  }, [inspiration?.id]);

  async function checkFavoriteStatus() {
    if (!inspiration?.id) return;
    try {
      const res = await authFetch(`/api/favorites/check?inspirationId=${inspiration.id}`);
      const data = await res.json();
      setIsFavorited(data.isFavorited || false);
    } catch (e) {
      console.error('Error checking favorite status:', e);
    }
  }

  async function toggleFavorite() {
    if (!inspiration?.id || favoriteLoading) return;
    
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        const res = await authFetch(`/api/favorites?inspirationId=${inspiration.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setIsFavorited(false);
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error('Failed to remove favorite:', errorData);
          setError(errorData.details || 'Failed to remove favorite');
        }
      } else {
        // Add to favorites
        const res = await authFetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inspirationId: inspiration.id }),
        });
        if (res.ok) {
          setIsFavorited(true);
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error('Failed to add favorite:', errorData);
          setError(errorData.details || 'Failed to add favorite');
        }
      }
    } catch (e: any) {
      console.error('Error toggling favorite:', e);
      setError(e?.message || 'Failed to toggle favorite');
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function fetchToday() {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/daily', { cache: 'no-store' });
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
      const res = await authFetch('/api/daily', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errorMsg = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || 'Failed to generate';
        throw new Error(errorMsg);
      }
      const data = await res.json();
      setInspiration(data.inspiration);
      // Reset favorite status for new inspiration
      setIsFavorited(false);
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

      // 在手機上使用 Web Share API 保存到相簿
      if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `daily-inspiration-${inspiration.date}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Daily Inspiration',
            });
            return;
          }
        } catch (shareError) {
          // 如果分享失敗，回退到下載方式
          console.log('Share failed, falling back to download:', shareError);
        }
      }

      // 桌面端或分享失敗時使用下載方式
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
          {t.navDaily}
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
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-wood-600">
              Date: {inspiration.date}
            </div>
            <button
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                isFavorited
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-wood-100 text-wood-700 hover:bg-wood-200'
              }`}
            >
              {isFavorited ? '⭐ ' + t.removeFromFavorites : '☆ ' + t.addToFavorites}
            </button>
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
          <div className="font-semibold mb-1">{error}</div>
          <div className="text-sm opacity-80">
            如果問題持續，請檢查瀏覽器控制台（F12）查看詳細錯誤訊息，或確認已執行 Supabase SQL 政策。
          </div>
        </div>
      )}

      {/* YouTube Link - Prominent Button */}
      {inspiration?.content_json?.song?.youtube_url && (
        <div className="mt-8 mb-4 flex justify-center">
          <a
            href={inspiration.content_json.song.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
          >
            <svg
              className="w-6 h-6 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span className="font-semibold text-lg">
              {inspiration.content_json.song.youtube_url.includes('/results?search_query=')
                ? (language === 'zh-TW' ? '在 YouTube 搜尋' : language === 'ja' ? 'YouTube で検索' : 'Search on YouTube')
                : (language === 'zh-TW' ? '在 YouTube 播放' : language === 'ja' ? 'YouTube で再生' : 'Play on YouTube')}
            </span>
            <svg
              className="w-5 h-5 flex-shrink-0 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}

      {/* Algorithm Note Link */}
      <div className="mt-4 text-center">
        <Link 
          href="/daily/about" 
          className="text-sm text-wood-500 hover:text-wood-700 underline"
        >
          {t.algorithmNote}
        </Link>
      </div>
    </div>
  );
}


