'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';

export default function DailyAboutPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() || 'en');
  const t = getTranslation(language);

  useEffect(() => {
    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  const isChinese = language === 'zh-TW';
  const isJapanese = language === 'ja';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/daily" 
          className="text-accent hover:text-accent/80 text-sm mb-4 inline-block"
        >
          ← 返回每日雞湯
        </Link>
        <h1 className="text-3xl font-serif font-bold text-wood-800 mb-2">
          {t.algorithmTitle}
        </h1>
      </div>

      <div className="card space-y-6">
        <section>
          <h2 className="text-xl font-bold text-wood-800 mb-3">
            {isChinese ? '角色與任務' : isJapanese ? '役割とタスク' : 'Role & Task'}
          </h2>
          <div className="space-y-2 text-wood-700">
            <p>
              <strong>{isChinese ? '角色：' : isJapanese ? '役割：' : 'Role: '}</strong>
              {isChinese ? '世界級人生教練與智慧整合者' : isJapanese ? '世界クラスのライフコーチと知恵の統合者' : 'World-class life coach and wisdom synthesizer'}
            </p>
            <p>
              <strong>{isChinese ? '任務：' : isJapanese ? 'タスク：' : 'Task: '}</strong>
              {isChinese ? '使用傳奇導師的框架創造每日靈感' : isJapanese ? '伝説のメンターのフレームワークを使用して毎日のインスピレーションを作成' : 'Create daily inspiration using the frameworks of legendary mentors'}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-wood-800 mb-3">
            {isChinese ? '8 位導師風格（隨機選擇 1 位）' : isJapanese ? '8人のメンタースタイル（ランダムに1人を選択）' : '8 Mentor Styles (Randomly Select 1)'}
          </h2>
          <ul className="space-y-2 text-wood-700">
            <li><strong>Tony Robbins</strong> - {isChinese ? '高能量、行動導向' : isJapanese ? '高エネルギー、行動指向' : 'High energy, action-oriented'}</li>
            <li><strong>Stephen Covey</strong> - {isChinese ? '原則為中心、品格與效能' : isJapanese ? '原則中心、品格と効率' : 'Principle-centered, character and effectiveness'}</li>
            <li><strong>Simon Sinek</strong> - {isChinese ? '目的驅動、探索「為什麼」' : isJapanese ? '目的駆動、「なぜ」を探求' : 'Purpose-driven, exploring the "why"'}</li>
            <li><strong>Brené Brown</strong> - {isChinese ? '脆弱與勇氣、真實與全心生活' : isJapanese ? '脆弱性と勇気、真実と心からの生活' : 'Vulnerability and courage, authenticity and wholehearted living'}</li>
            <li><strong>Eckhart Tolle</strong> - {isChinese ? '當下覺察、內在平靜' : isJapanese ? '今この瞬間の気づき、内なる平穏' : 'Present-moment awareness, inner peace'}</li>
            <li><strong>Dale Carnegie</strong> - {isChinese ? '人際關係、影響力' : isJapanese ? '人間関係、影響力' : 'Human relations, influence'}</li>
            <li><strong>Viktor Frankl</strong> - {isChinese ? '意義與目的' : isJapanese ? '意味と目的' : 'Meaning and purpose'}</li>
            <li><strong>Carol Dweck</strong> - {isChinese ? '成長思維' : isJapanese ? '成長マインドセット' : 'Growth mindset'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-wood-800 mb-3">
            {isChinese ? '生成流程' : isJapanese ? '生成プロセス' : 'Generation Process'}
          </h2>
          <ol className="space-y-3 text-wood-700 list-decimal list-inside">
            <li>
              {isChinese 
                ? '從 8 位導師中隨機選擇 1 位'
                : isJapanese
                ? '8人のメンターからランダムに1人を選択'
                : 'Randomly select 1 mentor from the 8 mentors'}
            </li>
            <li>
              {isChinese 
                ? '搜尋該導師曾經在書中、演說中、發表文章中說過的名言或金句'
                : isJapanese
                ? 'そのメンターが本、スピーチ、記事で語った名言や金言を検索'
                : 'Search for authentic quotes or wisdom statements from that mentor\'s books, speeches, or published articles'}
            </li>
            <li>
              {isChinese 
                ? '提取該名言或金句的核心訊息與本質'
                : isJapanese
                ? 'その名言や金言の核心メッセージと本質を抽出'
                : 'Extract the core message and essence from that quote'}
            </li>
            <li>
              {isChinese 
                ? '以核心訊息為基礎，用該導師的風格寫出一小段勵志雞湯文（約 50 字中文，或 50 字英文/日文）'
                : isJapanese
                ? '核心メッセージを基に、そのメンターのスタイルで短い励ましのメッセージを書く（約50文字の日本語、または50語の英語）'
                : 'Based on the core message, write a short inspirational message in that mentor\'s style (around 50 characters in Chinese, or 50 words in English/Japanese)'}
            </li>
            <li>
              {isChinese 
                ? '必須是原創內容，是對導師智慧的創意延伸，而非直接複製'
                : isJapanese
                ? 'オリジナルコンテンツである必要があり、メンターの知恵の創造的な拡張であり、直接コピーではない'
                : 'Must be original content, a creative expansion of the mentor\'s wisdom, not a direct copy'}
            </li>
            <li>
              {isChinese 
                ? '必須提供真實的歌曲推薦（標題、藝術家、YouTube 連結）'
                : isJapanese
                ? '実際の楽曲推薦を提供する必要がある（タイトル、アーティスト、YouTubeリンク）'
                : 'Must provide a real song recommendation (title, artist, YouTube link)'}
            </li>
          </ol>
        </section>

        <div className="pt-4 border-t border-wood-200">
          <Link 
            href="/daily" 
            className="btn-primary inline-block"
          >
            {isChinese ? '返回每日雞湯' : isJapanese ? 'デイリーに戻る' : 'Back to Daily Inspiration'}
          </Link>
        </div>
      </div>
    </div>
  );
}

