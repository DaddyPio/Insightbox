'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/utils/authFetch';
import { supabaseBrowser } from '@/lib/supabase/browser';

export default function CapturePage() {
  const router = useRouter();
  const [soundLike, setSoundLike] = useState('');
  const [contextSentence, setContextSentence] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (err) {
        console.error('Error checking auth:', err);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAudioUrl(previewUrl);
    }
  };

  const handleUpload = async () => {
    if (!audioFile) return;

    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await authFetch('/api/vocab/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload audio');
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please log in to save words');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 handleSubmit called, isAuthenticated:', isAuthenticated);
      
      let uploadedAudioUrl = null;
      if (audioFile) {
        console.log('📤 Uploading audio file...');
        uploadedAudioUrl = await handleUpload();
        console.log('✅ Audio uploaded:', uploadedAudioUrl);
      }

      console.log('📤 Calling authFetch for /api/vocab/words...');
      const response = await authFetch('/api/vocab/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sound_like: soundLike.trim(),
          context_sentence: contextSentence.trim(),
          audio_url: uploadedAudioUrl,
        }),
      });

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('❌ Response not OK:', data);
        if (response.status === 401) {
          setError('Please log in to save words');
          return;
        }
        throw new Error(data.error || 'Failed to save word');
      }

      const data = await response.json();
      console.log('✅ Word saved successfully:', data);
      router.push('/vocab/bank');
    } catch (err: any) {
      console.error('❌ Exception in handleSubmit:', err);
      setError(err.message || 'Failed to save word');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <div className="text-[#8B6F47]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-[#8B6F47] mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">Please log in to use the Vocabulary feature.</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-[#8B6F47] text-white rounded-lg hover:bg-[#7A5F3A] transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#8B6F47] mb-6">New Word</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Sound-like spelling */}
          <div>
            <label htmlFor="sound_like" className="block text-sm font-medium text-gray-700 mb-2">
              Sound-like Spelling
            </label>
            <textarea
              id="sound_like"
              value={soundLike}
              onChange={(e) => setSoundLike(e.target.value)}
              placeholder="How does it sound? (e.g., 'uh-bout' for 'about')"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent resize-none"
              rows={2}
              required
            />
          </div>

          {/* Context sentence */}
          <div>
            <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
              Context Sentence
            </label>
            <textarea
              id="context"
              value={contextSentence}
              onChange={(e) => setContextSentence(e.target.value)}
              placeholder="Sentence from podcast/article where you heard this word"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* Audio upload */}
          <div>
            <label htmlFor="audio" className="block text-sm font-medium text-gray-700 mb-2">
              Audio Recording (Optional)
            </label>
            <input
              type="file"
              id="audio"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
            />
            {audioUrl && (
              <div className="mt-2">
                <audio src={audioUrl} controls className="w-full mt-2" />
              </div>
            )}
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
              disabled={loading || !soundLike.trim()}
              className="flex-1 px-6 py-3 bg-[#8B6F47] text-white rounded-lg hover:bg-[#7A5F3A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

