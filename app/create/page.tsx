'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';
import { authFetch } from '@/lib/utils/authFetch';
import { toPng } from 'html-to-image';
import { imageStyles } from '@/lib/utils/imageStyles';

type Note = {
  id: string;
  title: string;
  content: string;
  tags?: string[];
};

type Mentor = {
  name: string;
  description: string;
};

type Topic = {
  title: string;
  angle: string;
  connection_to_notes: string;
  connection_to_mentor: string;
  platform: string;
};

type Article = {
  title: string;
  content: string;
  key_quote?: string;
};

type CardContent = {
  title: string;
  key_quote: string;
  reflection_quote: string;
  action_quote: string;
};

const MENTORS: Mentor[] = [
  { name: 'Tony Robbins', description: '高能量、行動導向、個人力量與轉化' },
  { name: 'Dale Carnegie', description: '人際關係、影響力與人際效能' },
  { name: 'Stephen Covey', description: '原則為中心、品格與效能' },
  { name: 'Oprah Winfrey', description: '真實、同理心、個人成長與賦權' },
  { name: 'Deepak Chopra', description: '意識、靈性、身心整合' },
  { name: 'Eckhart Tolle', description: '當下覺察、內在平靜與意識' },
  { name: 'Simon Sinek', description: '目的驅動、探索行動背後的「為什麼」' },
  { name: 'Brené Brown', description: '脆弱與勇氣、真實與全心生活' },
];

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() || 'en');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<string>('');
  const [extraction, setExtraction] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [cardContent, setCardContent] = useState<CardContent | null>(null);
  const [cardStyle, setCardStyle] = useState<'reflection' | 'action'>('reflection');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardImageRef = useRef<HTMLDivElement>(null);

  const t = getTranslation(language);

  useEffect(() => {
    fetchNotes();

    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  async function fetchNotes() {
    try {
      const res = await authFetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      } else {
        if (res.status === 401) {
          router.push('/login');
        }
      }
    } catch (e) {
      console.error('Error fetching notes:', e);
    }
  }

  function toggleNoteSelection(noteId: string) {
    setSelectedNoteIds((prev) => {
      if (prev.includes(noteId)) {
        return prev.filter((id) => id !== noteId);
      } else {
        if (prev.length >= 3) {
          return prev; // Max 3 notes
        }
        return [...prev, noteId];
      }
    });
  }

  async function handleStep2() {
    if (selectedNoteIds.length < 2) {
      setError('請至少選擇 2 個筆記');
      return;
    }
    setStep(2);
  }

  async function handleStep3() {
    if (!selectedMentor) {
      setError('請選擇一位導師');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/article/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteIds: selectedNoteIds,
          mentorStyle: selectedMentor,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to extract content');
      }
      const data = await res.json();
      console.log('Extraction data received:', data);
      
      if (!data.extraction) {
        throw new Error('No extraction data returned');
      }
      
      setExtraction(data.extraction);
      setStep(3);
      
      // Generate topics automatically after a short delay
      setTimeout(() => {
        handleStep4();
      }, 1000);
    } catch (e: any) {
      setError(e?.message || 'Failed to extract content');
    } finally {
      setLoading(false);
    }
  }

  async function handleStep4() {
    if (!extraction) {
      setError('請先完成內容萃取');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log('Generating topics with:', {
        noteIds: selectedNoteIds,
        mentorStyle: selectedMentor,
        extraction: extraction,
      });
      
      const res = await authFetch('/api/article/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteIds: selectedNoteIds,
          mentorStyle: selectedMentor,
          extraction,
        }),
      });
      
      const responseText = await res.text();
      console.log('Topics API response status:', res.status);
      console.log('Topics API response:', responseText);
      
      if (!res.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText || 'Failed to generate topics' };
        }
        const errorMsg = errorData.details 
          ? `${errorData.error}: ${errorData.details}` 
          : errorData.error || 'Failed to generate topics';
        throw new Error(errorMsg);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('Invalid response from server');
      }
      
      console.log('Received topics:', data);
      if (!data.topics || data.topics.length === 0) {
        throw new Error('No topics generated. Please try again.');
      }
      setTopics(data.topics);
      setStep(4);
    } catch (e: any) {
      console.error('Error generating topics:', e);
      setError(e?.message || 'Failed to generate topics');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectTopic(topic: Topic) {
    setSelectedTopic(topic);
    setStep(5);
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/article/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteIds: selectedNoteIds,
          mentorStyle: selectedMentor,
          extraction,
          selectedTopic: topic,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate article');
      }
      const data = await res.json();
      setArticle(data.article);
    } catch (e: any) {
      setError(e?.message || 'Failed to generate article');
    } finally {
      setLoading(false);
    }
  }

  async function handleStep6() {
    if (!article) {
      setError('請先生成文章');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/article/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate card content');
      }
      const data = await res.json();
      setCardContent(data.card);
    } catch (e: any) {
      setError(e?.message || 'Failed to generate card content');
    } finally {
      setLoading(false);
    }
  }

  async function downloadCard() {
    if (!cardImageRef.current || !cardContent) return;
    try {
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      if (document.fonts) {
        await document.fonts.ready;
      }

      const bgColor = '#d4c4a8';
      const dataUrl = await toPng(cardImageRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: bgColor,
      });

      // Mobile Web Share API
      if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `article-card-${Date.now()}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Article Card' });
            return;
          }
        } catch (shareError) {
          console.log('Share failed, falling back to download:', shareError);
        }
      }

      // Desktop download
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `article-card-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('download card error', e);
      alert('Failed to generate card image');
    }
  }

  const style = imageStyles['wooden'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold text-wood-800 mb-6">
        {t.createArticle}
      </h1>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-between">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                s === step
                  ? 'bg-accent text-white'
                  : s < step
                  ? 'bg-wood-300 text-wood-800'
                  : 'bg-wood-100 text-wood-600'
              }`}
            >
              {s}
            </div>
            {s < 6 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  s < step ? 'bg-wood-300' : 'bg-wood-100'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Step 1: Select Notes */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-wood-800 mb-2">{t.step1Title}</h2>
          <p className="text-wood-600 mb-6">{t.step1Description}</p>

          {notes.length === 0 ? (
            <p className="text-wood-600">沒有可用的筆記，請先創建一些筆記。</p>
          ) : (
            <>
              <div className="grid gap-4 mb-6">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => toggleNoteSelection(note.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedNoteIds.includes(note.id)
                        ? 'border-accent bg-accent/10'
                        : 'border-wood-200 hover:border-wood-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-wood-800 mb-1">{note.title}</h3>
                        <p className="text-sm text-wood-600 line-clamp-2">{note.content}</p>
                      </div>
                      {selectedNoteIds.includes(note.id) && (
                        <span className="ml-4 text-accent text-2xl">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-wood-600 mb-4">
                已選擇 {selectedNoteIds.length} / 3 個筆記
              </div>
              <button
                onClick={handleStep2}
                disabled={selectedNoteIds.length < 2}
                className="btn-primary disabled:opacity-50"
              >
                {t.nextStep}
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 2: Select Mentor */}
      {step === 2 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-wood-800 mb-2">{t.step2Title}</h2>
          <p className="text-wood-600 mb-6">{t.step2Description}</p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {MENTORS.map((mentor) => (
              <div
                key={mentor.name}
                onClick={() => setSelectedMentor(mentor.name)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedMentor === mentor.name
                    ? 'border-accent bg-accent/10'
                    : 'border-wood-200 hover:border-wood-300'
                }`}
              >
                <h3 className="font-semibold text-wood-800 mb-1">{mentor.name}</h3>
                <p className="text-sm text-wood-600">{mentor.description}</p>
                {selectedMentor === mentor.name && (
                  <span className="mt-2 inline-block text-accent">✓ 已選擇</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="btn-secondary">
              {t.previousStep}
            </button>
            <button
              onClick={handleStep3}
              disabled={!selectedMentor || loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? t.analyzing : t.nextStep}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Content Extraction */}
      {step === 3 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-wood-800 mb-2">{t.step3Title}</h2>
          <p className="text-wood-600 mb-6">{t.step3Description}</p>

          {extraction && (
            <div className="mb-6 space-y-4">
              <div>
                <h3 className="font-semibold text-wood-800 mb-2">重點摘要</h3>
                <ul className="list-disc list-inside text-wood-700 space-y-1">
                  {extraction.key_points?.map((point: string, i: number) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-wood-800 mb-2">深層主題</h3>
                <div className="flex flex-wrap gap-2">
                  {extraction.deep_themes?.map((theme: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-wood-100 text-wood-700 rounded-full text-sm">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="btn-secondary">
              {t.previousStep}
            </button>
            <button
              onClick={handleStep4}
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? t.generatingTopics : t.nextStep}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Select Topic */}
      {step === 4 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-wood-800 mb-2">{t.step4Title}</h2>
          <p className="text-wood-600 mb-6">{t.step4Description}</p>

          <div className="space-y-4 mb-6">
            {topics.map((topic, index) => (
              <div
                key={index}
                className="p-4 border-2 border-wood-200 rounded-lg hover:border-wood-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-wood-800">{topic.title}</h3>
                  <span className="px-2 py-1 bg-wood-100 text-wood-700 rounded text-xs">
                    {topic.platform}
                  </span>
                </div>
                <p className="text-sm text-wood-600 mb-2">
                  <strong>切角：</strong>{topic.angle}
                </p>
                <button
                  onClick={() => handleSelectTopic(topic)}
                  disabled={loading}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  {loading ? t.generatingArticle : t.selectTopic}
                </button>
              </div>
            ))}
          </div>

          <button onClick={() => setStep(3)} className="btn-secondary">
            {t.previousStep}
          </button>
        </div>
      )}

      {/* Step 5: Generate Article */}
      {step === 5 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-wood-800 mb-2">{t.step5Title}</h2>
          <p className="text-wood-600 mb-6">{t.step5Description}</p>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-wood-600">{t.generatingArticle}</div>
            </div>
          ) : article ? (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-wood-800 mb-4">{article.title}</h3>
              <div className="prose max-w-none text-wood-700 whitespace-pre-wrap">
                {article.content}
              </div>
            </div>
          ) : null}

          {article && (
            <div className="flex gap-4">
              <button onClick={() => setStep(4)} className="btn-secondary">
                {t.previousStep}
              </button>
              <button
                onClick={() => setStep(6)}
                className="btn-primary"
              >
                {t.nextStep}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 6: Generate Card */}
      {step === 6 && article && (
        <div className="card">
          <h2 className="text-2xl font-bold text-wood-800 mb-2">{t.step6Title}</h2>
          <p className="text-wood-600 mb-6">{t.step6Description}</p>

          {cardContent && (
            <div className="mb-6">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setCardStyle('reflection')}
                  className={`px-4 py-2 rounded-lg ${
                    cardStyle === 'reflection'
                      ? 'bg-accent text-white'
                      : 'bg-wood-100 text-wood-700'
                  }`}
                >
                  {t.cardStyleReflection}
                </button>
                <button
                  onClick={() => setCardStyle('action')}
                  className={`px-4 py-2 rounded-lg ${
                    cardStyle === 'action'
                      ? 'bg-accent text-white'
                      : 'bg-wood-100 text-wood-700'
                  }`}
                >
                  {t.cardStyleAction}
                </button>
              </div>

              {/* Card Preview */}
              <div className="flex justify-center mb-6">
                <div
                  ref={cardImageRef}
                  className="relative rounded-lg shadow-2xl overflow-hidden"
                  style={{
                    width: '540px',
                    height: '675px',
                    backgroundImage: style.background,
                    aspectRatio: '4/5',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    className="absolute border-4 rounded-lg"
                    style={{ inset: '1rem', borderColor: style.borderColor }}
                  />
                  <div
                    className="absolute flex flex-col items-center text-center p-8"
                    style={{ inset: '2rem' }}
                  >
                    <h3
                      className="font-serif font-bold mb-4"
                      style={{
                        color: style.titleColor,
                        fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                      }}
                    >
                      {cardContent.title}
                    </h3>
                    <div className="w-24 h-1 mb-4" style={{ backgroundColor: style.decorativeLine }} />
                    <p
                      className="font-serif leading-relaxed"
                      style={{
                        color: style.textColor,
                        fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                      }}
                    >
                      {cardStyle === 'reflection' ? cardContent.reflection_quote : cardContent.action_quote}
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={downloadCard} className="btn-primary">
                {t.downloadImage}
              </button>
            </div>
          )}

          {!cardContent && (
            <button
              onClick={handleStep6}
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? t.generatingCard : t.generateCard}
            </button>
          )}

          <button onClick={() => setStep(5)} className="btn-secondary mt-4">
            {t.previousStep}
          </button>
        </div>
      )}
    </div>
  );
}

