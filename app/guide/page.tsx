'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';

export default function GuidePage() {
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() || 'en');
  const t = getTranslation(language);

  useEffect(() => {
    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  const isChinese = language === 'zh-TW';
  const isJapanese = language === 'ja';

  const cards = [
    {
      icon: '🚀',
      title: isChinese ? '1. 首頁：快速記錄' : isJapanese ? '1. ホーム：迅速な記録' : '1. Home: Quick Capture',
      subtitle: isChinese ? '一秒捕捉你的靈感' : isJapanese ? 'インスピレーションを1秒でキャプチャ' : 'Capture your inspiration in one second',
      content: [
        {
          type: 'text',
          text: isChinese ? '✍️ 文字輸入' : isJapanese ? '✍️ テキスト入力' : '✍️ Text Input',
        },
        {
          type: 'list',
          items: isChinese 
            ? ['你突然想到的點子', '聽到的金句', '書摘', 'Podcast 心得', '心情一句話', '給孩子的想法']
            : isJapanese
            ? ['突然思いついたアイデア', '聞いた名言', '読書メモ', 'Podcast の感想', '気持ちの一言', '子供への想い']
            : ['Sudden ideas', 'Quotes you heard', 'Book excerpts', 'Podcast insights', 'A thought', 'Ideas for your child'],
        },
        {
          type: 'text',
          text: isChinese ? '🎤 語音輸入（AI 自動轉文字）' : isJapanese ? '🎤 音声入力（AI自動文字変換）' : '🎤 Voice Input (AI auto-transcription)',
        },
        {
          type: 'text',
          text: isChinese 
            ? '點 🎤 麥克風按鈕 → 說話 → InsightBox 自動轉成文字 → 自動建立卡片'
            : isJapanese
            ? '🎤 マイクボタンをクリック → 話す → InsightBox が自動的にテキストに変換 → 自動的にカードを作成'
            : 'Click 🎤 mic button → speak → InsightBox auto-transcribes → auto-creates card',
        },
      ],
    },
    {
      icon: '🧠',
      title: isChinese ? '2. 自動整理' : isJapanese ? '2. 自動整理' : '2. Auto Organization',
      subtitle: isChinese ? '標籤、主題、情緒' : isJapanese ? 'タグ、トピック、感情' : 'Tags, Topics, Emotions',
      content: [
        {
          type: 'list',
          items: isChinese
            ? ['✓ 自動摘要：將長段落整理成重點句', '✓ 自動標籤：如「親子」「工作」「成長」等', '✓ 自動主題分類：讓筆記不再雜亂', '✓ 情緒判斷：辨識文字情緒（反思、感謝、鼓勵…）']
            : isJapanese
            ? ['✓ 自動要約：長い段落を要点に整理', '✓ 自動タグ：「親子」「仕事」「成長」など', '✓ 自動トピック分類：ノートを整理', '✓ 感情判定：テキストの感情を識別（反省、感謝、励まし…）']
            : ['✓ Auto Summary: Organize long paragraphs into key points', '✓ Auto Tags: Like "Family", "Work", "Growth"', '✓ Auto Topic Classification: Keep notes organized', '✓ Emotion Detection: Identify text emotions (reflection, gratitude, encouragement...)'],
        },
      ],
    },
    {
      icon: '🗂️',
      title: isChinese ? '3. 卡片庫' : isJapanese ? '3. カードライブラリ' : '3. Card Library',
      subtitle: isChinese ? 'Zettelkasten 卡片盒筆記' : isJapanese ? 'Zettelkasten カードボックスノート' : 'Zettelkasten Card Box',
      content: [
        {
          type: 'text',
          text: isChinese ? '🔍 分類查看' : isJapanese ? '🔍 分類表示' : '🔍 Filter by',
        },
        {
          type: 'list',
          items: isChinese
            ? ['依時間', '依標籤', '依主題', '依情緒']
            : isJapanese
            ? ['時間順', 'タグ', 'トピック', '感情']
            : ['Time', 'Tags', 'Topics', 'Emotions'],
        },
        {
          type: 'text',
          text: isChinese ? '🧩 卡片連結（AI 推薦相關內容）' : isJapanese ? '🧩 カードリンク（AI関連コンテンツ推薦）' : '🧩 Card Links (AI recommends related content)',
        },
        {
          type: 'text',
          text: isChinese
            ? '點開卡片，AI 自動推薦與這張卡片相關的其他卡片。想法不是單獨存在，而是互相連結的。'
            : isJapanese
            ? 'カードを開くと、AI が自動的にこのカードに関連する他のカードを推薦します。アイデアは単独ではなく、相互にリンクしています。'
            : 'Open a card, and AI automatically recommends related cards. Ideas are not isolated but interconnected.',
        },
      ],
    },
    {
      icon: '💬',
      title: isChinese ? '4. 每日雞湯' : isJapanese ? '4. デイリーインスピレーション' : '4. Daily Inspiration',
      subtitle: isChinese ? '量身打造的每日心靈雞湯' : isJapanese ? 'パーソナライズされた毎日のインスピレーション' : 'Personalized daily inspiration',
      content: [
        {
          type: 'text',
          text: isChinese
            ? 'InsightBox 會從你的筆記中抓取重點，用 AI 歸納你的近期思考，隨機選擇一位世界級人生導師（如 Tony Robbins, Covey, Oprah…），以該導師的風格寫出 50 字以內、鼓勵又暖心的每日訊息。'
            : isJapanese
            ? 'InsightBox はあなたのノートから要点を抽出し、AI で最近の思考を要約し、世界クラスのライフコーチ（Tony Robbins、Covey、Oprah など）をランダムに選択し、そのメンターのスタイルで 50 文字以内の励ましと温かい毎日のメッセージを書きます。'
            : 'InsightBox extracts key points from your notes, summarizes your recent thoughts with AI, randomly selects a world-class life mentor (like Tony Robbins, Covey, Oprah...), and writes an encouraging, warm daily message of 50 words or less in that mentor\'s style.',
        },
      ],
    },
    {
      icon: '🎨',
      title: isChinese ? '5. 社群圖片產生器' : isJapanese ? '5. ソーシャルメディア画像ジェネレーター' : '5. Social Media Image Generator',
      subtitle: isChinese ? 'Woodstyle 木質感圖片' : isJapanese ? 'Woodstyle 木質感画像' : 'Woodstyle Wooden Images',
      content: [
        {
          type: 'text',
          text: isChinese ? '你可以把任何卡片變成木質感、溫暖、有質感的 IG/FB 貼文圖片。' : isJapanese ? '任意のカードを木質感のある温かみのある高品質な IG/FB 投稿画像に変換できます。' : 'Turn any card into a warm, high-quality wooden-style IG/FB post image.',
        },
        {
          type: 'text',
          text: isChinese ? '實用情境：' : isJapanese ? '実用的なシナリオ：' : 'Use cases:',
        },
        {
          type: 'list',
          items: isChinese
            ? ['po 心得文', '分享書摘', '生活洞見', '與孩子的對話', '心靈雞湯', '你想提醒自己的句子']
            : isJapanese
            ? ['感想を投稿', '読書メモを共有', '生活の洞察', '子供との会話', '心の栄養', '自分に思い出させたい言葉']
            : ['Share insights', 'Share book excerpts', 'Life insights', 'Conversations with children', 'Inspirational quotes', 'Reminders for yourself'],
        },
      ],
    },
    {
      icon: '✍️',
      title: isChinese ? '6. 長文創作' : isJapanese ? '6. 長文作成' : '6. Long-form Writing',
      subtitle: isChinese ? 'AI Essay 500–1000 字文章' : isJapanese ? 'AI Essay 500–1000 文字の記事' : 'AI Essay 500–1000 word articles',
      content: [
        {
          type: 'text',
          text: isChinese ? '流程：' : isJapanese ? 'プロセス：' : 'Process:',
        },
        {
          type: 'list',
          items: isChinese
            ? ['選 2～3 張卡片', '選擇 1 位人生導師', 'InsightBox 提出 5 個文章主題供你選', '選定主題', '自動產生一篇可直接用在 FB/IG/部落格的長文']
            : isJapanese
            ? ['2～3 枚のカードを選択', '1 人のライフコーチを選択', 'InsightBox が 5 つの記事トピックを提案', 'トピックを選択', 'FB/IG/ブログで直接使用できる長文を自動生成']
            : ['Select 2-3 cards', 'Choose 1 life mentor', 'InsightBox suggests 5 article topics', 'Select a topic', 'Auto-generate a long-form article ready for FB/IG/Blog'],
        },
      ],
    },
    {
      icon: '💌',
      title: isChinese ? '7. 寫給孩子的信' : isJapanese ? '7. 子供への手紙' : '7. Letters to Kids',
      subtitle: isChinese ? '用語音或文字，讓 AI 幫你寫出溫暖的信' : isJapanese ? '音声やテキストで、AI が温かい手紙を書く' : 'Use voice or text, let AI write warm letters',
      content: [
        {
          type: 'text',
          text: isChinese 
            ? '這裡是專門寫給孩子們的信。你可以用說的，讓 AI 幫你整理成一封好讀、溫暖的文字。未來可以匯出、收藏，甚至在孩子長大時送給他們。'
            : isJapanese
            ? 'これは子供たちへの手紙専用のスペースです。話した内容をAIが整理して、温かく読みやすい手紙にします。将来的にはエクスポート、保存、そして子供が成長したときに渡すこともできます。'
            : 'This is a dedicated space for writing letters to your children. You can speak your thoughts, and AI will help organize them into warm, readable letters. In the future, you can export, save, and even give them to your children when they grow up.',
        },
        {
          type: 'text',
          text: isChinese ? '使用流程：' : isJapanese ? '使用プロセス：' : 'Usage Process:',
        },
        {
          type: 'list',
          items: isChinese
            ? ['選擇寫給哪個孩子（大兒子、小兒子、全部孩子，或自訂名稱）', '選擇語氣風格（溫暖鼓勵、坦誠對話、故事式分享、簡短提醒）', '按住錄音按鈕說話，或直接在文字框中輸入內容', '語音會自動轉換成文字，你可以稍作編輯', '點擊「生成寫給孩子的信」，AI 會將你的話整理成溫暖、適合孩子閱讀的信件', '可以編輯 AI 生成的信件內容，然後儲存到信件庫', '在「過去的信件」中瀏覽、編輯、收藏或刪除已儲存的信件']
            : isJapanese
            ? ['どの子供に宛てるか選択（長男、次男、すべての子供、またはカスタム名）', 'トーンを選択（温かく励ます、正直な対話、ストーリーテリング、短いリマインダー）', '録音ボタンを押して話すか、テキストボックスに直接入力', '音声が自動的にテキストに変換され、編集可能', '「手紙を生成」をクリックすると、AIがあなたの言葉を温かく、子供が読みやすい手紙に整理', 'AI生成の手紙内容を編集して、手紙ライブラリに保存可能', '「過去の手紙」で保存された手紙を閲覧、編集、お気に入り登録、削除']
            : ['Select which child to write to (oldest son, youngest son, all children, or custom name)', 'Select tone style (warm & encouraging, honest talk, storytelling, short reminder)', 'Hold the record button and speak, or type directly in the text box', 'Voice is automatically converted to text, which you can edit', 'Click "Generate Letter" and AI will organize your words into a warm, child-friendly letter', 'You can edit the AI-generated letter content and save it to the letter library', 'Browse, edit, favorite, or delete saved letters in "Past Letters"'],
        },
        {
          type: 'text',
          text: isChinese ? 'AI 處理邏輯：' : isJapanese ? 'AI処理ロジック：' : 'AI Processing Logic:',
        },
        {
          type: 'list',
          items: isChinese
            ? ['分析原始語音轉文字的內容，提取核心訊息和情感（關愛、擔憂、驕傲、鼓勵、道歉等）', '用簡單、清晰的語言重新組織內容，適合 6-15 歲孩子閱讀', '保持溫暖、誠實的風格，避免過於「心靈雞湯」式的表達', '長度約 150-400 個中文字，足夠像一封真正的信，但不會太長']
            : isJapanese
            ? ['元の音声テキストの内容を分析し、核心メッセージと感情を抽出（愛情、心配、誇り、励まし、謝罪など）', '6-15歳の子供が読めるよう、シンプルで明確な言語で内容を再構成', '温かく誠実なスタイルを保ち、過度に「心の栄養」的な表現を避ける', '約150-400文字の日本語、本物の手紙のように十分だが、長すぎない']
            : ['Analyze the raw speech-to-text content, extract core messages and emotions (care, worry, pride, encouragement, apology, etc.)', 'Reorganize content in simple, clear language suitable for children aged 6-15', 'Maintain a warm, honest style, avoiding overly "chicken-soup-like" expressions', 'Length about 150-400 Chinese characters, enough to feel like a real letter but not too long'],
        },
      ],
    },
    {
      icon: '🔐',
      title: isChinese ? '8. 資料安全' : isJapanese ? '8. データセキュリティ' : '8. Data Security',
      subtitle: isChinese ? '僅自己可見' : isJapanese ? '自分だけが見られる' : 'Private to you',
      content: [
        {
          type: 'text',
          text: isChinese
            ? '所有筆記只有你能看到，你的資料不會被公開。未來如果開放多人，也會使用安全的 Supabase Auth 做權限控管。'
            : isJapanese
            ? 'すべてのノートはあなただけが見ることができ、データは公開されません。将来的に複数ユーザーに対応する場合も、安全な Supabase Auth を使用して権限管理を行います。'
            : 'All notes are visible only to you, and your data is not public. If multi-user support is added in the future, secure Supabase Auth will be used for access control.',
        },
      ],
    },
    {
      icon: '🎯',
      title: isChinese ? '9. 最適合這些人' : isJapanese ? '9. 最適なユーザー' : '9. Perfect For',
      subtitle: isChinese ? '誰適合使用 InsightBox' : isJapanese ? 'InsightBox に適した人' : 'Who should use InsightBox',
      content: [
        {
          type: 'list',
          items: isChinese
            ? ['每天生活中有很多靈感卻容易忘記的人', '喜歡閱讀、聽 Podcast、寫反思', '想打造個人品牌', '想把生活智慧留給孩子未來看的人', '想透過「卡片 → 文章 → 社群貼文」建立內容系統的人']
            : isJapanese
            ? ['毎日多くのインスピレーションがあるが忘れやすい人', '読書、Podcast、振り返りが好きな人', '個人ブランドを構築したい人', '生活の知恵を子供の未来に残したい人', '「カード → 記事 → ソーシャル投稿」でコンテンツシステムを構築したい人']
            : ['People with many daily inspirations who tend to forget them', 'Those who love reading, podcasts, and reflection', 'Those building a personal brand', 'Those who want to leave life wisdom for their children', 'Those who want to build a content system: "Cards → Articles → Social Posts"'],
        },
      ],
    },
    {
      icon: '❤️',
      title: isChinese ? '10. 你會得到什麼' : isJapanese ? '10. 得られるもの' : '10. What You\'ll Gain',
      subtitle: isChinese ? '使用 InsightBox 的價值' : isJapanese ? 'InsightBox を使用する価値' : 'The value of using InsightBox',
      content: [
        {
          type: 'list',
          items: isChinese
            ? ['你的靈感永遠不會再流失', '你的知識會慢慢變成可以分享的內容', '生活會被看見、被記錄', '你的孩子未來會看到一個版本的你：一個真心用心活著的父親']
            : isJapanese
            ? ['インスピレーションが二度と失われることはありません', '知識が徐々に共有可能なコンテンツになります', '生活が見られ、記録されます', '子供は将来、あなたの一つのバージョンを見るでしょう：心を込めて生きている父親']
            : ['Your inspirations will never be lost again', 'Your knowledge gradually becomes shareable content', 'Your life will be seen and recorded', 'Your children will see a version of you in the future: a father who lives with heart'],
        },
        {
          type: 'text',
          text: isChinese
            ? 'InsightBox 不是筆記工具，它是一個紀錄你人生的容器。每一個靈光一現，都會變成未來的智慧。'
            : isJapanese
            ? 'InsightBox はノートツールではなく、あなたの人生を記録する容器です。すべてのインスピレーションが将来の知恵になります。'
            : 'InsightBox is not a note-taking tool; it\'s a container that records your life. Every spark of inspiration becomes future wisdom.',
        },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-serif font-bold text-wood-800 mb-4">
          {t.guideTitle}
        </h1>
        <p className="text-lg text-wood-600 mb-2">
          {isChinese 
            ? '讓每一個靈光一現，都成為你的智慧財富。'
            : isJapanese
            ? 'すべてのインスピレーションをあなたの知恵の財産に。'
            : 'Turn every spark of inspiration into your wisdom treasure.'}
        </p>
        <p className="text-sm text-wood-500">
          {isChinese 
            ? 'InsightBox 是一款專為忙碌的成年人、注重自我成長的人所打造的靈感記錄 + 卡片盒筆記 + AI 創作平台。'
            : isJapanese
            ? 'InsightBox は忙しい大人や自己成長を重視する人のためのインスピレーション記録 + カードボックスノート + AI 創作プラットフォームです。'
            : 'InsightBox is an inspiration capture + card box notes + AI creation platform designed for busy adults who value self-growth.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className="card hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl flex-shrink-0">{card.icon}</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-wood-800 mb-1">
                  {card.title}
                </h2>
                <p className="text-sm text-wood-600 mb-4">
                  {card.subtitle}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-wood-700">
              {card.content.map((item, itemIndex) => {
                if (item.type === 'text') {
                  return (
                    <p key={itemIndex} className="text-sm leading-relaxed">
                      {item.text}
                    </p>
                  );
                } else if (item.type === 'list') {
                  return (
                    <ul key={itemIndex} className="list-disc list-inside space-y-1 text-sm">
                      {item.items?.map((listItem, listIndex) => (
                        <li key={listIndex}>{listItem}</li>
                      ))}
                    </ul>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link href="/" className="btn-primary">
          {isChinese ? '開始使用' : isJapanese ? '使い始める' : 'Get Started'}
        </Link>
      </div>
    </div>
  );
}

