'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Word {
  id: string;
  correct_word: string;
  definition: string;
  collocations: string[];
  my_work_sentence: string;
  audio_url: string;
  review_stage: number;
}

export default function ReviewPage() {
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchTodayWords();
  }, []);

  const fetchTodayWords = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/vocab/words?next_review_date=${today}&status=reviewing`);
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      const data = await response.json();
      setWords(data.words || []);
    } catch (err) {
      console.error('Error fetching words:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (action: 'know' | 'dont_know' | 'master') => {
    if (processing || currentIndex >= words.length) return;

    setProcessing(true);
    const currentWord = words[currentIndex];

    try {
      const response = await fetch(`/api/vocab/words/${currentWord.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      // Remove current word from list
      const newWords = words.filter((w) => w.id !== currentWord.id);
      setWords(newWords);

      // If no more words, go back to bank
      if (newWords.length === 0) {
        router.push('/vocab/bank');
      }
    } catch (err) {
      console.error('Error updating review:', err);
      alert('Failed to update review. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <div className="text-[#8B6F47]">Loading...</div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-[#8B6F47] mb-4">All Done! 🎉</h2>
          <p className="text-gray-600 mb-6">No words to review today.</p>
          <button
            onClick={() => router.push('/vocab/bank')}
            className="px-6 py-3 bg-[#8B6F47] text-white rounded-lg hover:bg-[#7A5F3A] transition-colors"
          >
            Go to Vocabulary Bank
          </button>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const remaining = words.length;

  return (
    <div className="min-h-screen bg-[#F5F1EB] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 text-right text-sm text-gray-600">
          {remaining} {remaining === 1 ? 'word' : 'words'} remaining
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Word */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#8B6F47] mb-2">
              {currentWord.correct_word}
            </h1>
            {currentWord.audio_url && (
              <div className="mt-4">
                <audio src={currentWord.audio_url} controls className="mx-auto" />
              </div>
            )}
          </div>

          {/* Definition */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-2">Definition</h2>
            <p className="text-gray-900">{currentWord.definition}</p>
          </div>

          {/* Collocations */}
          {currentWord.collocations && currentWord.collocations.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Collocations</h2>
              <div className="flex flex-wrap gap-2">
                {currentWord.collocations.map((coll, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#F5F1EB] text-[#8B6F47] rounded-full text-sm"
                  >
                    {coll}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Work sentence */}
          {currentWord.my_work_sentence && (
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">My Work Sentence</h2>
              <p className="text-gray-900 italic">&quot;{currentWord.my_work_sentence}&quot;</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={() => handleReview('know')}
              disabled={processing}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
            >
              ✓ Know It
            </button>
            <button
              onClick={() => handleReview('dont_know')}
              disabled={processing}
              className="w-full px-6 py-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
            >
              ✗ Don&apos;t Know
            </button>
            <button
              onClick={() => handleReview('master')}
              disabled={processing}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
            >
              ★ Master
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

