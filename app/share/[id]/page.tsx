'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import type { Note } from '@/lib/supabase/types';
import { detectLanguage } from '@/lib/utils/language';
import { imageStyles, type ImageStyle } from '@/lib/utils/imageStyles';

export default function SharePage() {
  const params = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('wooden');
  const [language, setLanguage] = useState<'zh-TW' | 'en'>('en');
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
      
      // Detect language from note content
      if (data.note?.content) {
        const detectedLang = detectLanguage(data.note.content);
        setLanguage(detectedLang);
      }
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
      const style = imageStyles[selectedStyle];
      // Get background color from style (extract from gradient or use default)
      const bgColor = selectedStyle === 'wooden' ? '#d4c4a8' : 
                     selectedStyle === 'minimal' ? '#ffffff' :
                     selectedStyle === 'modern' ? '#667eea' :
                     selectedStyle === 'elegant' ? '#f5f7fa' : '#f093fb';
      
      const dataUrl = await toPng(imageRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: bgColor,
        width: 1080,
        height: 1080,
      });

      const link = document.createElement('a');
      link.download = `insightbox-${note.id}-${selectedStyle}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMsg = language === 'zh-TW' 
        ? '生成圖片失敗，請重試。' 
        : 'Failed to generate image. Please try again.';
      alert(errorMsg);
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
        <Link href="/cards" className="text-accent hover:underline mt-2 inline-block">
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
          {language === 'zh-TW' ? '分享圖片預覽' : 'Share Image Preview'}
        </h2>
        <p className="text-wood-600 mb-4">
          {language === 'zh-TW' 
            ? '選擇風格並下載社交媒體分享圖片。' 
            : 'Choose a style and download a social media share image.'}
        </p>
        
        {/* Style Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-wood-700 mb-2">
            {language === 'zh-TW' ? '選擇風格' : 'Select Style'}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(Object.keys(imageStyles) as ImageStyle[]).map((style) => {
              const styleConfig = imageStyles[style];
              const isSelected = selectedStyle === style;
              return (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? 'border-accent bg-accent text-white' 
                      : 'border-wood-300 bg-wood-50 hover:border-wood-400 text-wood-700'
                    }
                  `}
                >
                  <div className="font-semibold text-sm mb-1">
                    {language === 'zh-TW' ? styleConfig.nameZh : styleConfig.name}
                  </div>
                  <div className="text-xs opacity-75">
                    {language === 'zh-TW' ? styleConfig.descriptionZh : styleConfig.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={downloadImage}
          disabled={downloading}
          className="btn-primary disabled:opacity-50 w-full"
        >
          {downloading 
            ? (language === 'zh-TW' ? '生成中...' : 'Generating...') 
            : (language === 'zh-TW' ? '下載圖片' : 'Download Image')
          }
        </button>
      </div>

      {/* Image Preview */}
      <div className="flex justify-center mb-6">
        <div
          ref={imageRef}
          className="relative w-[540px] h-[540px] rounded-lg shadow-2xl overflow-hidden"
          style={{
            backgroundImage: imageStyles[selectedStyle].background,
            backgroundColor: selectedStyle === 'minimal' ? '#ffffff' : undefined,
          }}
        >
          {/* Decorative border */}
          <div 
            className="absolute inset-4 border-4 rounded-lg"
            style={{ borderColor: imageStyles[selectedStyle].borderColor }}
          ></div>
          
          {/* Content */}
          <div className="absolute inset-8 flex flex-col justify-center items-center p-8 text-center">
            {/* Quote icon */}
            <div 
              className="text-6xl mb-4 opacity-30"
              style={{ color: imageStyles[selectedStyle].textColor }}
              dangerouslySetInnerHTML={{ __html: imageStyles[selectedStyle].quoteIcon }}
            />
            
            {/* Main quote */}
            <p 
              className="font-serif text-3xl leading-relaxed mb-6"
              style={{ 
                color: imageStyles[selectedStyle].textColor,
                fontFamily: language === 'zh-TW' ? 'var(--font-noto-sans-tc), "Microsoft JhengHei", "PingFang TC", sans-serif' : 'Georgia, serif'
              }}
            >
              {note.content.length > 200 
                ? note.content.substring(0, 200) + '...' 
                : note.content}
            </p>
            
            {/* Title */}
            <p 
              className="font-serif text-xl font-semibold mb-4"
              style={{ 
                color: imageStyles[selectedStyle].titleColor,
                fontFamily: language === 'zh-TW' ? '"Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif' : 'Georgia, serif'
              }}
            >
              {note.title}
            </p>
            
            {/* Decorative line */}
            <div 
              className="w-24 h-1 mb-4"
              style={{ backgroundColor: imageStyles[selectedStyle].decorativeLine }}
            ></div>
            
            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {note.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: imageStyles[selectedStyle].tagBg,
                      color: imageStyles[selectedStyle].tagText,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Bottom branding */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p 
                className="text-sm font-serif"
                style={{ color: imageStyles[selectedStyle].textColor, opacity: 0.7 }}
              >
                InsightBox
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

