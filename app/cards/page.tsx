'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NoteCard from '@/components/NoteCard';
import type { Note } from '@/lib/supabase/types';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';

export default function CardsPage() {
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() || 'en');
  const t = getTranslation(language);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [emotionFilter, setEmotionFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // Get unique values for filters
  const topics = Array.from(new Set(notes.map(n => n.topic).filter(Boolean))) as string[];
  const emotions = Array.from(new Set(notes.map(n => n.emotion).filter(Boolean))) as string[];
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));

  useEffect(() => {
    fetchNotes();
    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, topicFilter, emotionFilter, tagFilter]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (topicFilter) params.append('topic', topicFilter);
      if (emotionFilter) params.append('emotion', emotionFilter);
      if (tagFilter) params.append('tag', tagFilter);
      params.append('sort', 'latest');

      const { authFetch } = await import('@/lib/utils/authFetch');
      const response = await authFetch(`/api/notes?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch notes');

      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setTopicFilter('');
    setEmotionFilter('');
    setTagFilter('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-wood-800 mb-4">
          {t.navCards}
        </h1>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Topics</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
            
            <select
              value={emotionFilter}
              onChange={(e) => setEmotionFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Emotions</option>
              {emotions.map(emotion => (
                <option key={emotion} value={emotion}>{emotion}</option>
              ))}
            </select>
            
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          
          {(search || topicFilter || emotionFilter || tagFilter) && (
            <button
              onClick={clearFilters}
              className="btn-secondary text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-wood-300 border-t-accent rounded-full animate-spin"></div>
          <p className="mt-4 text-wood-600">{t.loading}</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 bg-wood-50 rounded-lg p-8 border border-wood-200">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-wood-800 text-lg font-medium mb-2">
            {t.noCardsYet}
          </p>
          <p className="text-wood-600 mb-6">
            {t.noCardsHint}
          </p>
          <Link href="/" className="btn-primary inline-block">
            {t.goToHome}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}

