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
  },
};

export function getTranslation(lang: AppLanguage): Translations {
  return translations[lang] || translations['en'];
}

