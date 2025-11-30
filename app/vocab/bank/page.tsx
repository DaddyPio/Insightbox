'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Word {
  id: string;
  sound_like: string;
  correct_word: string;
  definition: string;
  status: string;
  tags: string[];
  next_review_date: string;
  created_at: string;
}

export default function BankPage() {
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');

  useEffect(() => {
    fetchWords();
  }, []);

  useEffect(() => {
    filterWords();
  }, [words, search, statusFilter, tagFilter]);

  const fetchWords = async () => {
    try {
      let url = '/api/vocab/words';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (tagFilter) params.append('tag', tagFilter);
      if (params.toString()) url += '?' + params.toString();

      const response = await fetch(url);
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

  const filterWords = () => {
    let filtered = [...words];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((word) => {
        return (
          word.sound_like?.toLowerCase().includes(searchLower) ||
          word.correct_word?.toLowerCase().includes(searchLower) ||
          word.definition?.toLowerCase().includes(searchLower) ||
          word.tags?.some((t) => t.toLowerCase().includes(searchLower))
        );
      });
    }

    setFilteredWords(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inbox':
        return 'bg-gray-100 text-gray-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'mastered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    words.forEach((word) => {
      word.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <div className="text-[#8B6F47]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#8B6F47]">Vocabulary Bank</h1>
          <button
            onClick={() => router.push('/vocab/capture')}
            className="px-6 py-3 bg-[#8B6F47] text-white rounded-lg hover:bg-[#7A5F3A] transition-colors"
          >
            + New Word
          </button>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search by word, meaning, collocations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  fetchWords();
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
              >
                <option value="">All</option>
                <option value="inbox">Inbox</option>
                <option value="processing">Processing</option>
                <option value="reviewing">Reviewing</option>
                <option value="mastered">Mastered</option>
              </select>
            </div>

            {/* Tag filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
              <select
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  fetchWords();
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
              >
                <option value="">All</option>
                {getAllTags().map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Words list */}
        <div className="space-y-4">
          {filteredWords.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No words found.</p>
            </div>
          ) : (
            filteredWords.map((word) => (
              <div
                key={word.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  if (word.status === 'inbox') {
                    router.push(`/vocab/process/${word.id}`);
                  } else {
                    router.push(`/vocab/process/${word.id}`);
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#8B6F47]">
                      {word.correct_word || word.sound_like || 'Untitled'}
                    </h3>
                    {word.sound_like && word.correct_word && (
                      <p className="text-sm text-gray-500 italic">"{word.sound_like}"</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      word.status
                    )}`}
                  >
                    {word.status}
                  </span>
                </div>

                {word.definition && (
                  <p className="text-gray-700 mb-3 line-clamp-2">{word.definition}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {word.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-[#F5F1EB] text-[#8B6F47] rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-gray-500">
                  {word.next_review_date && (
                    <span>Next review: {new Date(word.next_review_date).toLocaleDateString()}</span>
                  )}
                  {!word.next_review_date && (
                    <span>Created: {new Date(word.created_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

