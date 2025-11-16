'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import type { Note } from '@/lib/supabase/types';
import { detectLanguage } from '@/lib/utils/language';
import { imageStyles, type ImageStyle } from '@/lib/utils/imageStyles';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';

export default function SharePage() {
  const params = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [regeneratingTitle, setRegeneratingTitle] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('wooden');
  const [detectedLang, setDetectedLang] = useState<AppLanguage>('en');
  const [selectedLang, setSelectedLang] = useState<AppLanguage | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Use selected language if set, otherwise use detected language
  const language = selectedLang || detectedLang;
  const t = getTranslation(language);

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
        const detected = detectLanguage(data.note.content);
        setDetectedLang(detected);
        // Auto-select detected language if no manual selection
        if (!selectedLang) {
          setSelectedLang(detected);
        }
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setLoading(false);
    }
  };

  // Smart content truncation based on character count and language
  const truncateContent = (content: string, maxLength: number): string => {
    if (content.length <= maxLength) return content;
    
    // For Chinese and Japanese, count characters differently
    if (language === 'zh-TW' || language === 'ja') {
      // CJK characters take more visual space, so truncate earlier
      const cjkMaxLength = Math.floor(maxLength * 0.7);
      if (content.length <= cjkMaxLength) return content;
      return content.substring(0, cjkMaxLength) + '...';
    }
    
    // For English, try to break at word boundary
    const truncated = content.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
  };

  // Check if device is mobile/tablet
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Save image to mobile photo gallery
  const saveToMobileGallery = async (dataUrl: string, filename: string) => {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/png' });

      // Use Web Share API if available (iOS Safari, Chrome Android)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: filename,
        });
        return true;
      }

      // Fallback: Try to download (will save to Downloads on Android)
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      return false;
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
      
      // Use optimal social media size: 1080x1350 (4:5 ratio, perfect for Instagram, Facebook)
      const targetWidth = 1080;
      const targetHeight = 1350;
      
      // Clone the preview element for exact rendering
      const previewElement = imageRef.current;
      const clonedElement = previewElement.cloneNode(true) as HTMLElement;
      
      // Set exact dimensions on cloned element
      clonedElement.style.width = `${targetWidth}px`;
      clonedElement.style.height = `${targetHeight}px`;
      clonedElement.style.position = 'fixed';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';
      clonedElement.style.margin = '0';
      clonedElement.style.padding = '0';
      clonedElement.style.transform = 'none';
      clonedElement.style.visibility = 'hidden';
      
      // Append to body temporarily
      document.body.appendChild(clonedElement);
      
      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(clonedElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: bgColor,
        width: targetWidth,
        height: targetHeight,
        cacheBust: true,
      });

      // Remove cloned element
      document.body.removeChild(clonedElement);

      const filename = `insightbox-${note.id}-${selectedStyle}.png`;

      // Save to mobile gallery if on mobile device
      if (isMobileDevice()) {
        const saved = await saveToMobileGallery(dataUrl, filename);
        if (saved) {
          alert(t.imageSavedToGallery);
          return;
        }
      }

      // Desktop: Download normally
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating image:', error);
      alert(t.failedToGenerateImage);
    } finally {
      setDownloading(false);
    }
  };

  const regenerateTitle = async () => {
    if (!note) return;

    setRegeneratingTitle(true);
    try {
      const response = await fetch(`/api/notes/${note.id}/regenerate-title`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to regenerate title');
      }

      const data = await response.json();
      setNote(data.note);
      
      alert(t.titleRegenerated);
    } catch (error) {
      console.error('Error regenerating title:', error);
      alert(t.failedToRegenerateTitle);
    } finally {
      setRegeneratingTitle(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-wood-300 border-t-accent rounded-full animate-spin"></div>
        <p className="mt-4 text-wood-600">Loading...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-wood-600 text-lg">Note not found.</p>
        <Link href="/cards" className="text-accent hover:underline mt-2 inline-block">
          {t.backToCards}
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
          {t.backToNote}
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-serif font-bold text-wood-800">
            {t.shareImagePreview}
          </h2>
          
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-wood-700">
              {language === 'zh-TW' ? '語言' : language === 'ja' ? '言語' : 'Language'}:
            </label>
            <select
              value={language}
              onChange={(e) => setSelectedLang(e.target.value as AppLanguage)}
              className="px-3 py-1 border border-wood-300 rounded-lg bg-white text-wood-700 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="zh-TW">中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
        
        <p className="text-wood-600 mb-4">
          {t.chooseStyleAndDownload}
        </p>

        {/* Regenerate Title Button */}
        <div className="mb-4">
          <button
            onClick={regenerateTitle}
            disabled={regeneratingTitle}
            className="btn-secondary w-full disabled:opacity-50"
          >
            {regeneratingTitle ? t.generating : t.aiRegenerateTitle}
          </button>
        </div>
        
        {/* Style Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-wood-700 mb-2">
            {t.selectStyle}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(Object.keys(imageStyles) as ImageStyle[]).map((style) => {
              const styleConfig = imageStyles[style];
              const isSelected = selectedStyle === style;
              const styleName = language === 'zh-TW' ? styleConfig.nameZh : 
                               language === 'ja' ? styleConfig.nameJa : 
                               styleConfig.name;
              const styleDesc = language === 'zh-TW' ? styleConfig.descriptionZh : 
                               language === 'ja' ? styleConfig.descriptionJa : 
                               styleConfig.description;
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
                    {styleName}
                  </div>
                  <div className="text-xs opacity-75">
                    {styleDesc}
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
          {downloading ? t.generating : t.downloadImage}
        </button>
      </div>

      {/* Image Preview */}
      <div className="flex justify-center mb-6">
        <div
          ref={imageRef}
          className="relative rounded-lg shadow-2xl overflow-hidden"
          style={{
            width: '540px',
            height: '675px',
            backgroundImage: imageStyles[selectedStyle].background,
            backgroundColor: selectedStyle === 'minimal' ? '#ffffff' : undefined,
            aspectRatio: '4/5',
            boxSizing: 'border-box',
          }}
        >
          {/* Decorative border */}
          <div 
            className="absolute border-4 rounded-lg"
            style={{ 
              borderColor: imageStyles[selectedStyle].borderColor,
              inset: '1rem',
              boxSizing: 'border-box',
            }}
          ></div>
          
          {/* Content */}
          <div 
            className="absolute flex flex-col justify-center items-center text-center"
            style={{ 
              inset: '2rem',
              height: 'calc(100% - 4rem)',
              width: 'calc(100% - 4rem)',
              boxSizing: 'border-box',
            }}
          >
            {/* Quote icon */}
            <div 
              className="text-6xl mb-4 opacity-30"
              style={{ color: imageStyles[selectedStyle].textColor }}
              dangerouslySetInnerHTML={{ __html: imageStyles[selectedStyle].quoteIcon }}
            />
            
            {/* Main quote */}
            <p 
              className="font-serif leading-relaxed mb-4 px-4"
              style={{ 
                color: imageStyles[selectedStyle].textColor,
                fontFamily: language === 'zh-TW' 
                  ? 'var(--font-noto-sans-tc), "Microsoft JhengHei", "PingFang TC", sans-serif' 
                  : language === 'ja'
                  ? 'var(--font-noto-sans-jp), "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif'
                  : 'Georgia, serif',
                fontSize: (language === 'zh-TW' || language === 'ja') 
                  ? 'clamp(1.5rem, 4vw, 2rem)' 
                  : 'clamp(1.25rem, 3.5vw, 1.75rem)',
                lineHeight: '1.6',
                maxHeight: '60%',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: (language === 'zh-TW' || language === 'ja') ? 8 : 6,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {truncateContent(note.content, (language === 'zh-TW' || language === 'ja') ? 100 : 150)}
            </p>
            
            {/* Title */}
            <p 
              className="font-serif font-semibold mb-3 px-4"
              style={{ 
                color: imageStyles[selectedStyle].titleColor,
                fontFamily: language === 'zh-TW' 
                  ? 'var(--font-noto-sans-tc), "Microsoft JhengHei", "PingFang TC", sans-serif' 
                  : language === 'ja'
                  ? 'var(--font-noto-sans-jp), "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif'
                  : 'Georgia, serif',
                fontSize: (language === 'zh-TW' || language === 'ja') 
                  ? 'clamp(1rem, 2.5vw, 1.25rem)' 
                  : 'clamp(0.875rem, 2vw, 1.125rem)',
                maxWidth: '90%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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

