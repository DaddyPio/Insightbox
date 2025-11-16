'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SpeechToTextButton from '@/components/SpeechToTextButton';

export default function Home() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/notes', {
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-wood-800 mb-4">
          Capture Your Insight
        </h1>
        <p className="text-wood-600 text-lg">
          Write or speak your thoughts. AI will help organize and understand them.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-wood-700 mb-2">
            Your Note
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Write or use the voice button below..."
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
                <span>Processing...</span>
              </span>
            ) : (
              'Save Note'
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
    </div>
  );
}

