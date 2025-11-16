'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import type { Note } from '@/lib/supabase/types';

export default function SharePage() {
  const params = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      fetchNote(params.id as string);
    }
  }, [params.id]);

  const fetchNote = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/share/${id}`);
      if (!response.ok) throw new Error('Note not found');

      const data = await response.json();
      setNote(data.note);
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!imageRef.current || !note) return;

    setDownloading(true);
    try {
      const dataUrl = await toPng(imageRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#d4c4a8',
        width: 1080,
        height: 1080,
      });

      const link = document.createElement('a');
      link.download = `insightbox-${note.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-wood-300 border-t-accent-DEFAULT rounded-full animate-spin"></div>
        <p className="mt-4 text-wood-600">Loading...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-wood-600 text-lg">Note not found.</p>
        <Link href="/cards" className="text-accent-DEFAULT hover:underline mt-2 inline-block">
          Back to Cards
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href={`/card/${note.id}`}
          className="inline-flex items-center text-wood-600 hover:text-wood-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Note
        </Link>
      </div>

      <div className="card mb-6">
        <h2 className="text-2xl font-serif font-bold text-wood-800 mb-4">
          Share Image Preview
        </h2>
        <p className="text-wood-600 mb-4">
          Click the button below to download a wooden-style social media image.
        </p>
        <button
          onClick={downloadImage}
          disabled={downloading}
          className="btn-primary disabled:opacity-50"
        >
          {downloading ? 'Generating...' : 'Download Image'}
        </button>
      </div>

      {/* Image Preview - Hidden but used for generation */}
      <div className="flex justify-center">
        <div
          ref={imageRef}
          className="relative w-[540px] h-[540px] bg-wood-texture bg-wood-300 rounded-lg shadow-2xl overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(212, 196, 168, 0.9) 0%, rgba(184, 160, 130, 0.9) 100%), url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wood' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Crect fill='%23d4c4a8' width='100' height='100'/%3E%3Cpath d='M0 50 Q25 40, 50 50 T100 50' stroke='%23b8a082' stroke-width='1' fill='none' opacity='0.3'/%3E%3Cpath d='M0 30 Q25 20, 50 30 T100 30' stroke='%23b8a082' stroke-width='1' fill='none' opacity='0.2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23wood)' width='100' height='100'/%3E%3C/svg%3E")`,
          }}
        >
          {/* Decorative border */}
          <div className="absolute inset-4 border-4 border-wood-700 rounded-lg"></div>
          
          {/* Content */}
          <div className="absolute inset-8 flex flex-col justify-center items-center p-8 text-center">
            {/* Quote icon */}
            <div className="text-wood-700 text-6xl mb-4 opacity-30">&ldquo;</div>
            
            {/* Main quote */}
            <p className="font-serif text-3xl text-wood-900 leading-relaxed mb-6">
              {note.content.length > 200 
                ? note.content.substring(0, 200) + '...' 
                : note.content}
            </p>
            
            {/* Title */}
            <p className="font-serif text-xl text-wood-800 font-semibold mb-4">
              {note.title}
            </p>
            
            {/* Decorative line */}
            <div className="w-24 h-1 bg-wood-600 mb-4"></div>
            
            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {note.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-wood-700 text-wood-100 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Bottom branding */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="text-wood-700 text-sm font-serif">InsightBox</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

