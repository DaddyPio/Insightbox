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
  navFavorites: string;
  navCreate: string;

  // Home page
  homeTitle: string;
  homeSubtitle: string;
  yourNote: string;
  placeholder: string;
  processing: string;
  saveNote: string;
  footerCopyright: string;
  
  // Auth
  loggedIn: string;
  logout: string;
  register: string;
  login: string;
  
  // Favorites
  addToFavorites: string;
  removeFromFavorites: string;
  favorites: string;
  noFavorites: string;
  favoritesTitle: string;
  
  // Article Creation
  createArticle: string;
  step1Title: string;
  step1Description: string;
  step2Title: string;
  step2Description: string;
  step3Title: string;
  step3Description: string;
  step4Title: string;
  step4Description: string;
  step5Title: string;
  step5Description: string;
  step6Title: string;
  step6Description: string;
  selectNotes: string;
  selectMentor: string;
  analyzing: string;
  generatingTopics: string;
  generatingArticle: string;
  generatingCard: string;
  nextStep: string;
  previousStep: string;
  selectTopic: string;
  generateCard: string;
  articleTitle: string;
  articleContent: string;
  cardStyleReflection: string;
  cardStyleAction: string;
  
  // Daily Inspiration Algorithm
  algorithmNote: string;
  algorithmTitle: string;
  
  // Guide
  guide: string;
  guideTitle: string;
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
    navWeeklyReview: '每週回顧',
    navDaily: '每日雞湯',
    navFavorites: '收藏',
    navCreate: '創作',
    homeTitle: '捕捉你的靈感',
    homeSubtitle: '用文字或語音記錄想法，AI 會協助整理與理解。',
    yourNote: '你的筆記',
    placeholder: '在想些什麼？可以輸入內容，或使用下方語音按鈕…',
    processing: '處理中…',
    saveNote: '儲存筆記',
    footerCopyright: 'APP版權為 DaddyPio',
    loggedIn: '已登入',
    logout: '登出',
    register: '註冊',
    login: '登入',
    addToFavorites: '收藏',
    removeFromFavorites: '取消收藏',
    favorites: '收藏',
    noFavorites: '還沒有收藏任何每日雞湯',
    favoritesTitle: '我的收藏',
    createArticle: '創作文章',
    step1Title: '步驟 1：選擇卡片筆記',
    step1Description: '選擇 2-3 個卡片筆記作為文章的主軸內容',
    step2Title: '步驟 2：選擇人生導師',
    step2Description: '選擇一位導師的哲學風格來輔助文章觀點',
    step3Title: '步驟 3：內容萃取',
    step3Description: 'AI 正在分析你的筆記，萃取重點和深層主題',
    step4Title: '步驟 4：選擇文章主題',
    step4Description: '從 5 個生成的主題中選擇一個',
    step5Title: '步驟 5：生成文章',
    step5Description: 'AI 正在生成 500-1000 字的完整文章',
    step6Title: '步驟 6：生成圖卡',
    step6Description: '生成 IG/FB 分享圖卡',
    selectNotes: '選擇筆記',
    selectMentor: '選擇導師',
    analyzing: '分析中...',
    generatingTopics: '生成主題中...',
    generatingArticle: '生成文章中...',
    generatingCard: '生成圖卡中...',
    nextStep: '下一步',
    previousStep: '上一步',
    selectTopic: '選擇此主題',
    generateCard: '生成圖卡',
    articleTitle: '文章標題',
    articleContent: '文章內容',
    cardStyleReflection: '深度反思版',
    cardStyleAction: '行動短句版',
    algorithmNote: '生成配方',
    algorithmTitle: '每日雞湯演算法說明',
    guide: '使用說明',
    guideTitle: 'InsightBox 官方使用說明',
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
    navDaily: 'Daily Inspiration',
    navFavorites: 'Favorites',
    navCreate: 'Create',
    homeTitle: 'Capture Your Insight',
    homeSubtitle: 'Write or speak your thoughts. AI will help organize and understand them.',
    yourNote: 'Your Note',
    placeholder: "What's on your mind? Write or use the voice button below...",
    processing: 'Processing...',
    saveNote: 'Save Note',
    footerCopyright: 'App Copyright © DaddyPio',
    loggedIn: 'Logged in',
    logout: 'Logout',
    register: 'Register',
    login: 'Login',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    favorites: 'Favorites',
    noFavorites: 'No favorites yet',
    favoritesTitle: 'My Favorites',
    createArticle: 'Create Article',
    step1Title: 'Step 1: Select Notes',
    step1Description: 'Select 2-3 card notes as the main content',
    step2Title: 'Step 2: Select Mentor',
    step2Description: 'Choose a mentor\'s philosophy style to guide the article',
    step3Title: 'Step 3: Content Extraction',
    step3Description: 'AI is analyzing your notes and extracting key points',
    step4Title: 'Step 4: Choose Topic',
    step4Description: 'Select one from 5 generated topics',
    step5Title: 'Step 5: Generate Article',
    step5Description: 'AI is generating a 500-1000 word article',
    step6Title: 'Step 6: Generate Card',
    step6Description: 'Generate IG/FB share card',
    selectNotes: 'Select Notes',
    selectMentor: 'Select Mentor',
    analyzing: 'Analyzing...',
    generatingTopics: 'Generating Topics...',
    generatingArticle: 'Generating Article...',
    generatingCard: 'Generating Card...',
    nextStep: 'Next',
    previousStep: 'Previous',
    selectTopic: 'Select This Topic',
    generateCard: 'Generate Card',
    articleTitle: 'Article Title',
    articleContent: 'Article Content',
    cardStyleReflection: 'Reflection Style',
    cardStyleAction: 'Action Style',
    algorithmNote: 'Inspiration recipe',
    algorithmTitle: 'Daily Inspiration Algorithm',
    guide: 'User Guide',
    guideTitle: 'InsightBox User Guide',
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
    navFavorites: 'お気に入り',
    navCreate: '作成',
    homeTitle: 'ひらめきをキャプチャ',
    homeSubtitle: '文章や音声で考えを記録。AIが整理と理解を手助けします。',
    yourNote: 'あなたのノート',
    placeholder: '今何を考えていますか？入力するか、下の音声ボタンを使ってください…',
    processing: '処理中...',
    saveNote: 'ノートを保存',
    footerCopyright: 'アプリの著作権 © DaddyPio',
    loggedIn: 'ログイン中',
    logout: 'ログアウト',
    register: '登録',
    login: 'ログイン',
    addToFavorites: 'お気に入りに追加',
    removeFromFavorites: 'お気に入りから削除',
    favorites: 'お気に入り',
    noFavorites: 'お気に入りはまだありません',
    favoritesTitle: 'マイお気に入り',
    createArticle: '記事を作成',
    step1Title: 'ステップ 1：ノートを選択',
    step1Description: 'メインコンテンツとして 2-3 つのカードノートを選択',
    step2Title: 'ステップ 2：メンターを選択',
    step2Description: '記事を導くメンターの哲学スタイルを選択',
    step3Title: 'ステップ 3：コンテンツ抽出',
    step3Description: 'AI がノートを分析し、重要なポイントを抽出中',
    step4Title: 'ステップ 4：トピックを選択',
    step4Description: '生成された 5 つのトピックから 1 つを選択',
    step5Title: 'ステップ 5：記事を生成',
    step5Description: 'AI が 500-1000 語の記事を生成中',
    step6Title: 'ステップ 6：カードを生成',
    step6Description: 'IG/FB 共有カードを生成',
    selectNotes: 'ノートを選択',
    selectMentor: 'メンターを選択',
    analyzing: '分析中...',
    generatingTopics: 'トピック生成中...',
    generatingArticle: '記事生成中...',
    generatingCard: 'カード生成中...',
    nextStep: '次へ',
    previousStep: '前へ',
    selectTopic: 'このトピックを選択',
    generateCard: 'カードを生成',
    articleTitle: '記事タイトル',
    articleContent: '記事コンテンツ',
    cardStyleReflection: 'リフレクションスタイル',
    cardStyleAction: 'アクションスタイル',
    algorithmNote: 'アルゴリズム情報',
    algorithmTitle: 'デイリーインスピレーションアルゴリズム',
    guide: '使用ガイド',
    guideTitle: 'InsightBox 使用ガイド',
  },
};

export function getTranslation(lang: AppLanguage): Translations {
  return translations[lang] || translations['en'];
}

