/**
 * Translation strings for the application
 */

export type AppLanguage = 'zh-TW' | 'en' | 'ja';

export interface Translations {
  // Share page
  shareImagePreview: string;
  chooseStyleAndDownload: string;
  selectStyle: string;
  downloadImage: string;
  generating: string;
  aiRegenerateTitle: string;
  backToNote: string;
  backToCards: string;
  imageSavedToGallery: string;
  failedToGenerateImage: string;
  titleRegenerated: string;
  failedToRegenerateTitle: string;
  
  // Style names
  styleWooden: string;
  styleMinimal: string;
  styleModern: string;
  styleElegant: string;
  styleBold: string;
  
  // Style descriptions
  styleWoodenDesc: string;
  styleMinimalDesc: string;
  styleModernDesc: string;
  styleElegantDesc: string;
  styleBoldDesc: string;
  
  // Navigation
  navHome: string;
  navCards: string;
  navWeeklyReview: string;
  navDaily: string;

  // Home page
  homeTitle: string;
  homeSubtitle: string;
  yourNote: string;
  placeholder: string;
  processing: string;
  saveNote: string;
  footerCopyright: string;
}

export const translations: Record<AppLanguage, Translations> = {
  'zh-TW': {
    shareImagePreview: '分享圖片預覽',
    chooseStyleAndDownload: '選擇風格並下載社交媒體分享圖片。',
    selectStyle: '選擇風格',
    downloadImage: '下載圖片',
    generating: '生成中...',
    aiRegenerateTitle: '🤖 AI 重新生成標題',
    backToNote: '返回 Note',
    backToCards: '返回卡片',
    imageSavedToGallery: '圖片已保存到相簿！',
    failedToGenerateImage: '生成圖片失敗，請重試。',
    titleRegenerated: '標題已重新生成！',
    failedToRegenerateTitle: '重新生成標題失敗，請重試。',
    styleWooden: '木質風格',
    styleMinimal: '極簡風格',
    styleModern: '現代風格',
    styleElegant: '優雅風格',
    styleBold: '大膽風格',
    styleWoodenDesc: '溫暖的木質質感，經典風格',
    styleMinimalDesc: '簡潔清爽的設計',
    styleModernDesc: '大膽現代的設計',
    styleElegantDesc: '精緻優雅的設計',
    styleBoldDesc: '鮮明醒目的設計',
    navHome: '首頁',
    navCards: '卡片',
    navWeeklyReview: '週報',
    navDaily: '每日靈感',
    homeTitle: '捕捉你的靈感',
    homeSubtitle: '用文字或語音記錄想法，AI 會協助整理與理解。',
    yourNote: '你的筆記',
    placeholder: '在想些什麼？可以輸入內容，或使用下方語音按鈕…',
    processing: '處理中…',
    saveNote: '儲存筆記',
    footerCopyright: 'APP版權為 DaddyPio',
  },
  'en': {
    shareImagePreview: 'Share Image Preview',
    chooseStyleAndDownload: 'Choose a style and download a social media share image.',
    selectStyle: 'Select Style',
    downloadImage: 'Download Image',
    generating: 'Generating...',
    aiRegenerateTitle: '🤖 AI Regenerate Title',
    backToNote: 'Back to Note',
    backToCards: 'Back to Cards',
    imageSavedToGallery: 'Image saved to gallery!',
    failedToGenerateImage: 'Failed to generate image. Please try again.',
    titleRegenerated: 'Title regenerated!',
    failedToRegenerateTitle: 'Failed to regenerate title. Please try again.',
    styleWooden: 'Wooden',
    styleMinimal: 'Minimal',
    styleModern: 'Modern',
    styleElegant: 'Elegant',
    styleBold: 'Bold',
    styleWoodenDesc: 'Warm wooden texture with classic feel',
    styleMinimalDesc: 'Clean and simple design',
    styleModernDesc: 'Bold and contemporary',
    styleElegantDesc: 'Sophisticated and refined',
    styleBoldDesc: 'Vibrant and eye-catching',
    navHome: 'Home',
    navCards: 'Cards',
    navWeeklyReview: 'Weekly Review',
    navDaily: 'Daily',
    homeTitle: 'Capture Your Insight',
    homeSubtitle: 'Write or speak your thoughts. AI will help organize and understand them.',
    yourNote: 'Your Note',
    placeholder: "What's on your mind? Write or use the voice button below...",
    processing: 'Processing...',
    saveNote: 'Save Note',
    footerCopyright: 'App Copyright © DaddyPio',
  },
  'ja': {
    shareImagePreview: 'シェア画像プレビュー',
    chooseStyleAndDownload: 'スタイルを選択して、ソーシャルメディア共有画像をダウンロードします。',
    selectStyle: 'スタイルを選択',
    downloadImage: '画像をダウンロード',
    generating: '生成中...',
    aiRegenerateTitle: '🤖 AI タイトルを再生成',
    backToNote: 'ノートに戻る',
    backToCards: 'カードに戻る',
    imageSavedToGallery: '画像がアルバムに保存されました！',
    failedToGenerateImage: '画像の生成に失敗しました。もう一度お試しください。',
    titleRegenerated: 'タイトルが再生成されました！',
    failedToRegenerateTitle: 'タイトルの再生成に失敗しました。もう一度お試しください。',
    styleWooden: '木質スタイル',
    styleMinimal: 'ミニマルスタイル',
    styleModern: 'モダンスタイル',
    styleElegant: 'エレガントスタイル',
    styleBold: '大胆スタイル',
    styleWoodenDesc: '温かみのある木質の質感、クラシックなスタイル',
    styleMinimalDesc: 'クリーンでシンプルなデザイン',
    styleModernDesc: '大胆で現代的なデザイン',
    styleElegantDesc: '洗練された上品なデザイン',
    styleBoldDesc: '鮮やかで目を引くデザイン',
    navHome: 'ホーム',
    navCards: 'カード',
    navWeeklyReview: '週間レビュー',
    navDaily: 'デイリー',
    homeTitle: 'ひらめきをキャプチャ',
    homeSubtitle: '文章や音声で考えを記録。AIが整理と理解を手助けします。',
    yourNote: 'あなたのノート',
    placeholder: '今何を考えていますか？入力するか、下の音声ボタンを使ってください…',
    processing: '処理中...',
    saveNote: 'ノートを保存',
    footerCopyright: 'アプリの著作権 © DaddyPio',
  },
};

export function getTranslation(lang: AppLanguage): Translations {
  return translations[lang] || translations['en'];
}

