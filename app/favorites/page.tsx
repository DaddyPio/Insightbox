'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';
import { authFetch } from '@/lib/utils/authFetch';
import { imageStyles } from '@/lib/utils/imageStyles';

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
  favoriteId?: string;
  favoritedAt?: string;
};

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() || 'en');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const t = getTranslation(language);

  useEffect(() => {
    fetchFavorites();

    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  async function fetchFavorites() {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        console.log('Favorites data:', data); // Debug log
        setInspirations(data.inspirations || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to fetch favorites:', errorData);
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        setError(errorData.details || 'Failed to load favorites');
      }
    } catch (e) {
      console.error('Error fetching favorites:', e);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(inspirationId: string) {
    try {
      const res = await authFetch(`/api/favorites?inspirationId=${inspirationId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        // Remove from local state
        setInspirations(inspirations.filter((insp) => insp.id !== inspirationId));
      }
    } catch (e) {
      console.error('Error removing favorite:', e);
    }
  }

  const style = imageStyles['wooden'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold text-wood-800 mb-6">
        {t.favoritesTitle}
      </h1>

      {loading ? (
        <div className="text-center text-wood-600">Loading...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : inspirations.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-wood-700 text-lg mb-4">{t.noFavorites}</p>
          <button
            onClick={() => router.push('/daily')}
            className="btn-primary"
          >
            {t.navDaily}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {inspirations.map((inspiration) => (
            <div key={inspiration.id} className="card">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-wood-600">
                  Date: {inspiration.date}
                </div>
                <button
                  onClick={() => removeFavorite(inspiration.id)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                >
                  ⭐ {t.removeFromFavorites}
                </button>
              </div>

              {/* Wooden Preview */}
              <div className="flex justify-center mb-6">
                <div
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
                                {inspiration.content_json.song.youtube_url.includes('/results?search_query=') ? 'Search on YouTube' : 'YouTube'}
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
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

