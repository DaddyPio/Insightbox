'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';
import { authFetch } from '@/lib/utils/authFetch';
import LetterVoiceInput from '@/components/LetterVoiceInput';
import SpeechToTextButton from '@/components/SpeechToTextButton';

type Letter = {
  id: string;
  child_name: string;
  child_label?: string;
  title?: string;
  raw_text: string;
  ai_letter: string;
  ai_summary?: string;
  tone: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

type GeneratedLetter = {
  title: string;
  letter: string;
  summary?: string;
};

export default function LettersPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'past'>('new');
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() || 'en');
  const [childName, setChildName] = useState<string>('');
  const [tone, setTone] = useState<'warm' | 'honest' | 'story' | 'short'>('warm');
  const [rawText, setRawText] = useState<string>('');
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedLetter | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Past letters
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loadingLetters, setLoadingLetters] = useState(false);
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [editingLetter, setEditingLetter] = useState<string>('');

  const router = useRouter();
  const t = getTranslation(language);

  useEffect(() => {
    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  useEffect(() => {
    if (activeTab === 'past') {
      fetchLetters();
    }
  }, [activeTab, selectedChildFilter]);

  const handleTranscription = (text: string) => {
    setRawText((prev) => prev + (prev ? ' ' : '') + text);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!rawText.trim()) {
      setError('請先輸入或錄製文字');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const finalChildName = childName.trim() || undefined;

      const res = await authFetch('/api/letters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawText.trim(),
          childName: finalChildName,
          tone,
          locale: language === 'zh-TW' ? 'zh-TW' : language === 'ja' ? 'ja' : 'en',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '生成失敗');
      }

      const data = await res.json();
      setGeneratedLetter(data.letter);
      setEditingLetter(data.letter.letter);
    } catch (e: any) {
      console.error('Error generating letter:', e);
      setError(e?.message || '生成信件失敗');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedLetter || !editingLetter.trim()) {
      setError('沒有可儲存的信件內容');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const finalChildName = childName.trim() || '全部孩子';

      const res = await authFetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: finalChildName,
          title: generatedLetter.title,
          rawText: rawText.trim(),
          aiLetter: editingLetter.trim(),
          aiSummary: generatedLetter.summary || '',
          tone,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '儲存失敗');
      }

      setSuccess(t.letterSaved);
      setRawText('');
      setGeneratedLetter(null);
      setEditingLetter('');
      
      // Refresh letters list if on past tab
      if (activeTab === 'past') {
        fetchLetters();
      }
    } catch (e: any) {
      console.error('Error saving letter:', e);
      setError(e?.message || '儲存信件失敗');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!editingLetter) return;
    try {
      await navigator.clipboard.writeText(editingLetter);
      setSuccess(t.copied);
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) {
      setError('複製失敗');
    }
  };

  const fetchLetters = async () => {
    setLoadingLetters(true);
    setError(null);
    try {
      const childParam = selectedChildFilter === 'all' ? '' : `?childName=${encodeURIComponent(selectedChildFilter)}`;
      const res = await authFetch(`/api/letters${childParam}`);
      if (res.ok) {
        const data = await res.json();
        setLetters(data.letters || []);
      } else {
        throw new Error('載入失敗');
      }
    } catch (e: any) {
      console.error('Error fetching letters:', e);
      setError(e?.message || '載入信件失敗');
    } finally {
      setLoadingLetters(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這封信嗎？')) return;
    
    try {
      const res = await authFetch(`/api/letters/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccess(t.letterDeleted);
        fetchLetters();
        if (selectedLetter?.id === id) {
          setSelectedLetter(null);
        }
      } else {
        throw new Error('刪除失敗');
      }
    } catch (e: any) {
      setError(e?.message || '刪除失敗');
    }
  };

  const handleToggleFavorite = async (letter: Letter) => {
    try {
      const res = await authFetch(`/api/letters/${letter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !letter.is_favorite }),
      });
      if (res.ok) {
        fetchLetters();
        if (selectedLetter?.id === letter.id) {
          setSelectedLetter({ ...selectedLetter, is_favorite: !selectedLetter.is_favorite });
        }
      }
    } catch (e) {
      console.error('Error toggling favorite:', e);
    }
  };

  const handleUpdateLetter = async () => {
    if (!selectedLetter || !editingLetter.trim()) return;
    
    try {
      const res = await authFetch(`/api/letters/${selectedLetter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiLetter: editingLetter.trim() }),
      });
      if (res.ok) {
        setSuccess(t.letterUpdated);
        fetchLetters();
        const data = await res.json();
        setSelectedLetter(data.letter);
      } else {
        throw new Error('更新失敗');
      }
    } catch (e: any) {
      setError(e?.message || '更新失敗');
    }
  };

  // Get unique child names for filter
  const childNames = Array.from(new Set(letters.map(l => l.child_name)));

  const isChinese = language === 'zh-TW';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 bg-wood-50 p-6 rounded-lg">
        <h1 className="text-4xl font-serif font-bold text-wood-800 mb-4">
          {isChinese ? '給孩子的信' : isJapanese ? '子供への手紙' : 'Letters to Kids'}
        </h1>
        <p className="text-wood-600 text-lg mb-2">
          {t.lettersDescription}
        </p>
        <p className="text-sm text-wood-500">
          {t.lettersFutureNote}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-wood-200 mb-6">
        <button
          onClick={() => setActiveTab('new')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'new'
              ? 'text-wood-900 border-b-2 border-wood-800'
              : 'text-wood-600 hover:text-wood-800'
          }`}
        >
          {t.newLetter}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'past'
              ? 'text-wood-900 border-b-2 border-wood-800'
              : 'text-wood-600 hover:text-wood-800'
          }`}
        >
          {t.pastLetters}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {/* New Letter Tab */}
      {activeTab === 'new' && (
        <div className="space-y-6">
          {/* Child Name Input */}
          <div>
            <label htmlFor="childName" className="block text-sm font-medium text-wood-700 mb-2">
              {t.selectChild}
            </label>
            <input
              id="childName"
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder={t.enterChildName}
              className="input-field"
            />
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-sm font-medium text-wood-700 mb-2">
              {t.toneSelector}
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as typeof tone)}
              className="input-field"
            >
              <option value="warm">{t.toneWarm}</option>
              <option value="honest">{t.toneHonest}</option>
              <option value="story">{t.toneStory}</option>
              <option value="short">{t.toneShort}</option>
            </select>
          </div>

          {/* Voice Input */}
          <div>
            <label className="block text-sm font-medium text-wood-700 mb-2">
              {isChinese ? '語音輸入' : 'Voice Input'}
            </label>
            <LetterVoiceInput onTranscription={handleTranscription} disabled={isGenerating} />
          </div>

          {/* Raw Text Input */}
          <div>
            <label htmlFor="rawText" className="block text-sm font-medium text-wood-700 mb-2">
              {t.rawTextLabel}
            </label>
            <textarea
              id="rawText"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={t.rawTextPlaceholder}
              rows={6}
              className="input-field resize-none"
              disabled={isGenerating}
            />
            <div className="mt-2">
              <SpeechToTextButton onTranscription={handleTranscription} disabled={isGenerating} />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !rawText.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{t.regenerating}</span>
              </span>
            ) : (
              t.generateLetter
            )}
          </button>

          {/* Generated Letter */}
          {generatedLetter && (
            <div className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-2">
                  {t.letterTitle}
                </label>
                <input
                  type="text"
                  value={generatedLetter.title}
                  onChange={(e) => setGeneratedLetter({ ...generatedLetter, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-wood-700 mb-2">
                  {t.letterContent}
                </label>
                <textarea
                  value={editingLetter}
                  onChange={(e) => setEditingLetter(e.target.value)}
                  rows={12}
                  className="input-field resize-none font-serif"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-secondary"
                >
                  {t.regenerateLetter}
                </button>
                <button
                  onClick={handleCopy}
                  className="btn-secondary"
                >
                  {t.copyText}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary"
                >
                  {isSaving ? '儲存中...' : t.saveLetter}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Past Letters Tab */}
      {activeTab === 'past' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Letters List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium text-wood-700">{t.filterByChild}:</label>
              <select
                value={selectedChildFilter}
                onChange={(e) => setSelectedChildFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">{t.filterAll}</option>
                {childNames.map((name) => (
                  <option key={name} value={name}>
                    {t.letterTo} {name}
                  </option>
                ))}
              </select>
            </div>

            {loadingLetters ? (
              <div className="text-center text-wood-600 py-8">載入中...</div>
            ) : letters.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-wood-700 text-lg">{t.noLetters}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {letters.map((letter) => (
                  <div
                    key={letter.id}
                    className="card cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setSelectedLetter(letter);
                      setEditingLetter(letter.ai_letter);
                      setShowOriginal(false);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-wood-600">
                            {t.letterTo} {letter.child_name}
                          </span>
                          {letter.is_favorite && <span>⭐</span>}
                        </div>
                        <h3 className="font-semibold text-wood-800 mb-1">
                          {letter.title || '無標題'}
                        </h3>
                        <p className="text-sm text-wood-600 line-clamp-2">
                          {letter.ai_letter}
                        </p>
                        <p className="text-xs text-wood-500 mt-2">
                          {new Date(letter.created_at).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(letter);
                        }}
                        className="ml-2 text-yellow-500 hover:text-yellow-600"
                      >
                        {letter.is_favorite ? '⭐' : '☆'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Letter Detail Sidebar */}
          {selectedLetter && (
            <div className="lg:col-span-1">
              <div className="card sticky top-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-wood-800">
                    {selectedLetter.title || '無標題'}
                  </h3>
                  <button
                    onClick={() => setSelectedLetter(null)}
                    className="text-wood-500 hover:text-wood-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-sm text-wood-600">
                  <p>{t.letterTo} {selectedLetter.child_name}</p>
                  <p>{new Date(selectedLetter.created_at).toLocaleDateString('zh-TW')}</p>
                </div>

                <div>
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="text-sm text-wood-600 hover:text-wood-800 underline"
                  >
                    {showOriginal ? t.hideOriginal : t.showOriginal}
                  </button>
                </div>

                {showOriginal && (
                  <div className="bg-wood-50 p-3 rounded text-sm text-wood-700">
                    <p className="font-medium mb-2">{t.originalText}:</p>
                    <p className="whitespace-pre-wrap">{selectedLetter.raw_text}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-2">
                    {t.letterContent}
                  </label>
                  <textarea
                    value={editingLetter}
                    onChange={(e) => setEditingLetter(e.target.value)}
                    rows={10}
                    className="input-field resize-none font-serif"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleUpdateLetter}
                    className="btn-primary"
                  >
                    {t.editLetter}
                  </button>
                  <button
                    onClick={() => handleToggleFavorite(selectedLetter)}
                    className="btn-secondary"
                  >
                    {selectedLetter.is_favorite ? t.unfavoriteLetter : t.favoriteLetter}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedLetter.id)}
                    className="btn-secondary text-red-600 hover:bg-red-50"
                  >
                    {t.deleteLetter}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

