'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authFetch } from '@/lib/utils/authFetch';

interface Word {
  id: string;
  sound_like: string;
  correct_word: string;
  definition: string;
  context_sentence: string;
  my_work_sentence: string;
  my_general_sentence: string;
  collocations: string[];
  part_of_speech: string;
  register: string;
  tags: string[];
  audio_url: string;
  status: string;
}

export default function ProcessPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedInfo, setGeneratedInfo] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [formData, setFormData] = useState({
    correct_word: '',
    definition: '',
    context_sentence: '',
    my_work_sentence: '',
    my_general_sentence: '',
    collocations: '',
    part_of_speech: '',
    register: '',
    tags: '',
  });

  const fetchWord = async () => {
    try {
      const response = await authFetch(`/api/vocab/words/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch word');
      }
      const data = await response.json();
      setWord(data.word);
      // Auto-fill correct_word with sound_like if correct_word is empty
      const initialCorrectWord = data.word.correct_word || data.word.sound_like || '';
      setFormData({
        correct_word: initialCorrectWord,
        definition: data.word.definition || '',
        context_sentence: data.word.context_sentence || '',
        my_work_sentence: data.word.my_work_sentence || '',
        my_general_sentence: data.word.my_general_sentence || '',
        collocations: (data.word.collocations || []).join(', '),
        part_of_speech: data.word.part_of_speech || '',
        register: data.word.register || '',
        tags: (data.word.tags || []).join(', '),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const calculateNextReviewDate = (stage: number): string => {
    const today = new Date();
    const days = [1, 2, 4, 7, 14, 30];
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + (days[stage] || 1));
    return nextDate.toISOString().split('T')[0];
  };

  const handleGenerate = async () => {
    if (!word) return;
    
    setGenerating(true);
    setError(null);
    setGeneratedInfo(null);

    try {
      const response = await authFetch(`/api/vocab/words/${id}/generate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate word information');
      }

      const data = await response.json();
      setGeneratedInfo(data.wordInfo);

      // Auto-fill form with generated data
      setFormData({
        ...formData,
        correct_word: data.word.correct_word || formData.correct_word,
        definition: data.wordInfo.definition || formData.definition,
        part_of_speech: data.wordInfo.part_of_speech || formData.part_of_speech,
        register: data.wordInfo.register || formData.register,
        collocations: (data.wordInfo.collocations || []).join(', ') || formData.collocations,
        context_sentence: data.word.context_sentence || formData.context_sentence,
        my_work_sentence: data.word.my_work_sentence || formData.my_work_sentence,
        my_general_sentence: data.word.my_general_sentence || formData.my_general_sentence,
      });

      // Update word state
      setWord(data.word);
    } catch (err: any) {
      setError(err.message || 'Failed to generate word information');
    } finally {
      setGenerating(false);
    }
  };

  const handlePlayPronunciation = () => {
    const wordToPronounce = formData.correct_word || word?.correct_word || word?.sound_like;
    if (!wordToPronounce) return;

    // Stop any ongoing speech
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    // Use Web Speech API to pronounce the word
    const utterance = new SpeechSynthesisUtterance(wordToPronounce);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setError('Failed to play pronunciation');
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const collocationsArray = formData.collocations
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const nextReviewDate = calculateNextReviewDate(0);

      const response = await authFetch(`/api/vocab/words/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          collocations: collocationsArray,
          tags: tagsArray,
          status: 'reviewing',
          next_review_date: nextReviewDate,
          review_stage: 0,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save word');
      }

      router.push('/vocab/bank');
    } catch (err: any) {
      setError(err.message || 'Failed to save word');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <div className="text-[#8B6F47]">Loading...</div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <div className="text-red-600">Word not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#8B6F47] mb-2">Process Word</h1>
            {word.sound_like && (
              <p className="text-gray-600">Sound-like: &quot;{word.sound_like}&quot;</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !word}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>一鍵生成單字資訊</span>
              </>
            )}
          </button>
        </div>

        {generatedInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">生成的單字資訊</h3>
            <div className="space-y-2 text-sm">
              {generatedInfo.pronunciation && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">發音：</span>
                  <span className="text-gray-700">{generatedInfo.pronunciation}</span>
                  <button
                    type="button"
                    onClick={handlePlayPronunciation}
                    className="ml-2 p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center"
                    title="播放發音"
                  >
                    {isPlaying ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
              {generatedInfo.chinese_translation && (
                <div>
                  <span className="font-medium">中文翻譯：</span>
                  <span className="text-gray-700">{generatedInfo.chinese_translation}</span>
                </div>
              )}
              {generatedInfo.synonyms && generatedInfo.synonyms.length > 0 && (
                <div>
                  <span className="font-medium">同義詞：</span>
                  <span className="text-gray-700">{generatedInfo.synonyms.join(', ')}</span>
                </div>
              )}
              {generatedInfo.example_sentences && generatedInfo.example_sentences.length > 0 && (
                <div>
                  <span className="font-medium">例句：</span>
                  <ul className="list-disc list-inside text-gray-700 ml-2">
                    {generatedInfo.example_sentences.map((sentence: string, idx: number) => (
                      <li key={idx}>{sentence}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Correct word */}
          <div>
            <label htmlFor="correct_word" className="block text-sm font-medium text-gray-700 mb-2">
              Correct Word *
            </label>
            <input
              type="text"
              id="correct_word"
              value={formData.correct_word}
              onChange={(e) => setFormData({ ...formData, correct_word: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
              required
            />
          </div>

          {/* Definition */}
          <div>
            <label htmlFor="definition" className="block text-sm font-medium text-gray-700 mb-2">
              Definition (Simple English) *
            </label>
            <textarea
              id="definition"
              value={formData.definition}
              onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          {/* Part of speech */}
          <div>
            <label htmlFor="part_of_speech" className="block text-sm font-medium text-gray-700 mb-2">
              Part of Speech
            </label>
            <select
              id="part_of_speech"
              value={formData.part_of_speech}
              onChange={(e) => setFormData({ ...formData, part_of_speech: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
            >
              <option value="">Select...</option>
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="adverb">Adverb</option>
              <option value="preposition">Preposition</option>
              <option value="conjunction">Conjunction</option>
              <option value="pronoun">Pronoun</option>
              <option value="interjection">Interjection</option>
            </select>
          </div>

          {/* Register */}
          <div>
            <label htmlFor="register" className="block text-sm font-medium text-gray-700 mb-2">
              Register
            </label>
            <select
              id="register"
              value={formData.register}
              onChange={(e) => setFormData({ ...formData, register: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
            >
              <option value="">Select...</option>
              <option value="formal">Formal</option>
              <option value="informal">Informal</option>
              <option value="technical">Technical</option>
            </select>
          </div>

          {/* Collocations */}
          <div>
            <label htmlFor="collocations" className="block text-sm font-medium text-gray-700 mb-2">
              Collocations (comma-separated)
            </label>
            <input
              type="text"
              id="collocations"
              value={formData.collocations}
              onChange={(e) => setFormData({ ...formData, collocations: e.target.value })}
              placeholder="e.g., make a decision, take action"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
            />
          </div>

          {/* Context sentence */}
          <div>
            <label htmlFor="context_sentence" className="block text-sm font-medium text-gray-700 mb-2">
              Context Sentence
            </label>
            <textarea
              id="context_sentence"
              value={formData.context_sentence}
              onChange={(e) => setFormData({ ...formData, context_sentence: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* My work sentence */}
          <div>
            <label htmlFor="my_work_sentence" className="block text-sm font-medium text-gray-700 mb-2">
              My Work Sentence
            </label>
            <textarea
              id="my_work_sentence"
              value={formData.my_work_sentence}
              onChange={(e) => setFormData({ ...formData, my_work_sentence: e.target.value })}
              placeholder="Write a sentence using this word in a work context"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* My general sentence */}
          <div>
            <label htmlFor="my_general_sentence" className="block text-sm font-medium text-gray-700 mb-2">
              My General Sentence
            </label>
            <textarea
              id="my_general_sentence"
              value={formData.my_general_sentence}
              onChange={(e) => setFormData({ ...formData, my_general_sentence: e.target.value })}
              placeholder="Write a sentence using this word in a general context"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., meeting, email, interview"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.correct_word.trim() || !formData.definition.trim()}
              className="flex-1 px-6 py-3 bg-[#8B6F47] text-white rounded-lg hover:bg-[#7A5F3A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : '確認'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

