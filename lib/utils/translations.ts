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
  
  // Auth prompts
  loginRequired: string;
  loginRequiredMessage: string;
  pleaseLoginOrSignup: string;
  goToLogin: string;
  goToSignup: string;
  
  // Letters to Kids
  navLetters: string;
  lettersTitle: string;
  lettersSubtitle: string;
  lettersDescription: string;
  lettersFutureNote: string;
  newLetter: string;
  pastLetters: string;
  selectChild: string;
  allChildren: string;
  oldestSon: string;
  youngestSon: string;
  customName: string;
  enterChildName: string;
  toneSelector: string;
  toneWarm: string;
  toneHonest: string;
  toneStory: string;
  toneShort: string;
  rawTextLabel: string;
  rawTextPlaceholder: string;
  generateLetter: string;
  regenerating: string;
  regenerateLetter: string;
  letterTitle: string;
  letterContent: string;
  saveLetter: string;
  copyText: string;
  copied: string;
  editLetter: string;
  noLetters: string;
  filterByChild: string;
  filterAll: string;
  letterTo: string;
  viewLetter: string;
  originalText: string;
  showOriginal: string;
  hideOriginal: string;
  favoriteLetter: string;
  unfavoriteLetter: string;
  deleteLetter: string;
  letterSaved: string;
  letterDeleted: string;
  letterUpdated: string;
  
  // Buttons
  refresh: string;
  generateTodaysInspiration: string;
  generatingInspiration: string;
  holdToSpeak: string;
  recording: string;
  releaseToStop: string;
  recordVoice: string;
  stopRecording: string;
  loading: string;
  
  // Home page improvements
  howToUse: string;
  step1Text: string;
  step2Text: string;
  step3Text: string;
  aiWillGenerate: string;
  aiWillGenerateTitle: string;
  aiWillGenerateTags: string;
  aiWillGenerateEmotion: string;
  aiWillGenerateSummary: string;
  recordingHint: string;
  transcriptionComplete: string;
  
  // Cards page improvements
  noCardsYet: string;
  noCardsHint: string;
  goToHome: string;
  
  // Create page improvements
  createDescription: string;
  
  // Guide page improvements
  quickStart: string;
  quickStartDescription: string;
  quickStartStep1: string;
  quickStartStep2: string;
  quickStartStep3: string;
  goToPage: string;
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
    navCards: '卡片筆記',
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
    guideTitle: 'InsightBox 使用說明',
    loginRequired: '需要登入',
    loginRequiredMessage: '儲存筆記需要先登入帳號',
    pleaseLoginOrSignup: '請先註冊或登入以使用此功能',
    goToLogin: '前往登入',
    goToSignup: '前往註冊',
    navLetters: '寫給孩子的信',
    lettersTitle: '寫給孩子的信',
    lettersSubtitle: '用說的，讓 AI 幫你整理成一封好讀、溫暖的文字',
    lettersDescription: '這裡是專門寫給孩子們的信。你可以用說的，讓 AI 幫你整理成一封好讀、溫暖的文字。',
    lettersFutureNote: '未來可以匯出、收藏，甚至在孩子長大時送給他們。',
    newLetter: '新建信件',
    pastLetters: '過去的信件',
    selectChild: '寫給',
    allChildren: '全部孩子',
    oldestSon: '大兒子',
    youngestSon: '小兒子',
    customName: '自訂名稱',
    enterChildName: '輸入孩子名稱',
    toneSelector: '語氣風格',
    toneWarm: '溫暖鼓勵',
    toneHonest: '坦誠對話',
    toneStory: '故事式分享',
    toneShort: '簡短提醒',
    rawTextLabel: '原始語音轉文字',
    rawTextPlaceholder: '語音轉換後的文字會顯示在這裡，你可以稍作編輯...',
    generateLetter: '生成寫給孩子的信',
    regenerating: '重新生成中...',
    regenerateLetter: '重生一次',
    letterTitle: '信件標題',
    letterContent: '信件內容',
    saveLetter: '儲存這封信',
    copyText: '複製文字',
    copied: '已複製',
    editLetter: '編輯信件',
    noLetters: '還沒有寫過信給孩子',
    filterByChild: '篩選',
    filterAll: '全部',
    letterTo: '給',
    viewLetter: '查看信件',
    originalText: '原始文字',
    showOriginal: '顯示原始文字',
    hideOriginal: '隱藏原始文字',
    favoriteLetter: '收藏',
    unfavoriteLetter: '取消收藏',
    deleteLetter: '刪除',
    letterSaved: '信件已儲存',
    letterDeleted: '信件已刪除',
    letterUpdated: '信件已更新',
    refresh: '重新載入',
    generateTodaysInspiration: '生成今日靈感',
    generatingInspiration: '生成中...',
    holdToSpeak: '按住開始說話',
    recording: '錄音中...',
    releaseToStop: '放開按鈕結束錄音',
    recordVoice: '語音輸入',
    stopRecording: '停止錄音',
    loading: '載入中...',
    howToUse: '如何使用 InsightBox？',
    step1Text: '在這裡輸入或錄音你的想法',
    step2Text: '按「儲存筆記」，AI 會自動幫你產生標題與標籤',
    step3Text: '去「卡片筆記」裡查看、整理，再用每日雞湯/長文創作',
    aiWillGenerate: '儲存後，AI 會為你自動產生：',
    aiWillGenerateTitle: '標題',
    aiWillGenerateTags: '標籤',
    aiWillGenerateEmotion: '情緒',
    aiWillGenerateSummary: '重點整理',
    recordingHint: '正在錄音…說完後再按一次',
    transcriptionComplete: '🎧 已由語音轉文字，你可以編輯後再存。',
    noCardsYet: '目前還沒有任何卡片。',
    noCardsHint: '👉 先到「首頁」輸入一則想法或錄一段語音，InsightBox 會自動幫你產生第一張卡片。',
    goToHome: '前往首頁',
    createDescription: '將你的筆記組合成 500–1000 字的長文，適合用在 FB、IG 長文或部落格。',
    quickStart: '第一次使用，不用全部看完',
    quickStartDescription: '先學會這三個功能就可以開始：',
    quickStartStep1: '首頁：快速記錄文字/語音',
    quickStartStep2: '卡片筆記：查看與整理卡片',
    quickStartStep3: '每日雞湯：看 AI 幫你寫的每日訊息',
    goToPage: '前往',
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
    loginRequired: 'Login Required',
    loginRequiredMessage: 'You need to log in to save notes',
    pleaseLoginOrSignup: 'Please sign up or log in to use this feature',
    goToLogin: 'Go to Login',
    goToSignup: 'Go to Sign Up',
    navLetters: 'Letters to Kids',
    lettersTitle: 'Letters to My Kids',
    lettersSubtitle: 'Speak your thoughts, let AI organize them into warm, readable letters',
    lettersDescription: 'This is a dedicated space for writing letters to your children. You can speak your thoughts, and AI will help organize them into warm, readable letters.',
    lettersFutureNote: 'In the future, you can export, save, and even give them to your children when they grow up.',
    newLetter: 'New Letter',
    pastLetters: 'Past Letters',
    selectChild: 'To',
    allChildren: 'All Children',
    oldestSon: 'Oldest Son',
    youngestSon: 'Youngest Son',
    customName: 'Custom Name',
    enterChildName: 'Enter child name',
    toneSelector: 'Tone',
    toneWarm: 'Warm & Encouraging',
    toneHonest: 'Honest Talk',
    toneStory: 'Storytelling',
    toneShort: 'Short Reminder',
    rawTextLabel: 'Raw Transcription',
    rawTextPlaceholder: 'Transcribed text will appear here, you can edit it...',
    generateLetter: 'Generate Letter',
    regenerating: 'Regenerating...',
    regenerateLetter: 'Regenerate',
    letterTitle: 'Letter Title',
    letterContent: 'Letter Content',
    saveLetter: 'Save Letter',
    copyText: 'Copy Text',
    copied: 'Copied',
    editLetter: 'Edit Letter',
    noLetters: 'No letters written yet',
    filterByChild: 'Filter',
    filterAll: 'All',
    letterTo: 'To',
    viewLetter: 'View Letter',
    originalText: 'Original Text',
    showOriginal: 'Show Original',
    hideOriginal: 'Hide Original',
    favoriteLetter: 'Favorite',
    unfavoriteLetter: 'Unfavorite',
    deleteLetter: 'Delete',
    letterSaved: 'Letter saved',
    letterDeleted: 'Letter deleted',
    letterUpdated: 'Letter updated',
    refresh: 'Refresh',
    generateTodaysInspiration: 'Generate Today\'s Inspiration',
    generatingInspiration: 'Generating...',
    holdToSpeak: 'Hold to Speak',
    recording: 'Recording...',
    releaseToStop: 'Release to Stop',
    recordVoice: 'Record Voice',
    stopRecording: 'Stop Recording',
    loading: 'Loading...',
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
    loginRequired: 'ログインが必要',
    loginRequiredMessage: 'ノートを保存するにはログインが必要です',
    pleaseLoginOrSignup: 'この機能を使用するには、サインアップまたはログインしてください',
    goToLogin: 'ログインへ',
    goToSignup: 'サインアップへ',
    navLetters: '子供への手紙',
    lettersTitle: '子供への手紙',
    lettersSubtitle: '話した内容をAIが整理して、温かく読みやすい手紙に',
    lettersDescription: 'これは子供たちへの手紙専用のスペースです。話した内容をAIが整理して、温かく読みやすい手紙にします。',
    lettersFutureNote: '将来的にはエクスポート、保存、そして子供が成長したときに渡すこともできます。',
    newLetter: '新しい手紙',
    pastLetters: '過去の手紙',
    selectChild: '宛先',
    allChildren: 'すべての子供',
    oldestSon: '長男',
    youngestSon: '次男',
    customName: 'カスタム名',
    enterChildName: '子供の名前を入力',
    toneSelector: 'トーン',
    toneWarm: '温かく励ます',
    toneHonest: '正直な対話',
    toneStory: 'ストーリーテリング',
    toneShort: '短いリマインダー',
    rawTextLabel: '生の文字起こし',
    rawTextPlaceholder: '文字起こしされたテキストがここに表示されます。編集できます...',
    generateLetter: '手紙を生成',
    regenerating: '再生成中...',
    regenerateLetter: '再生成',
    letterTitle: '手紙のタイトル',
    letterContent: '手紙の内容',
    saveLetter: '手紙を保存',
    copyText: 'テキストをコピー',
    copied: 'コピーしました',
    editLetter: '手紙を編集',
    noLetters: 'まだ手紙を書いていません',
    filterByChild: 'フィルター',
    filterAll: 'すべて',
    letterTo: '宛先',
    viewLetter: '手紙を表示',
    originalText: '元のテキスト',
    showOriginal: '元のテキストを表示',
    hideOriginal: '元のテキストを非表示',
    favoriteLetter: 'お気に入り',
    unfavoriteLetter: 'お気に入り解除',
    deleteLetter: '削除',
    letterSaved: '手紙を保存しました',
    letterDeleted: '手紙を削除しました',
    letterUpdated: '手紙を更新しました',
    refresh: '更新',
    generateTodaysInspiration: '今日のインスピレーションを生成',
    generatingInspiration: '生成中...',
    holdToSpeak: '押して話す',
    recording: '録音中...',
    releaseToStop: '離して停止',
    recordVoice: '音声入力',
    stopRecording: '録音停止',
    loading: '読み込み中...',
    howToUse: 'InsightBox の使い方？',
    step1Text: 'ここに考えを入力または録音',
    step2Text: '「ノートを保存」をクリック、AI が自動的にタイトルとタグを生成',
    step3Text: '「カード」で閲覧・整理し、デイリーインスピレーション/長文作成を使用',
    aiWillGenerate: '保存後、AI が自動的に生成：',
    aiWillGenerateTitle: 'タイトル',
    aiWillGenerateTags: 'タグ',
    aiWillGenerateEmotion: '感情',
    aiWillGenerateSummary: '要約',
    recordingHint: '録音中…終了したらもう一度クリック',
    transcriptionComplete: '🎧 音声から文字に変換されました。保存前に編集できます。',
    noCardsYet: 'まだカードがありません。',
    noCardsHint: '👉 「ホーム」で考えを入力または音声を録音すると、InsightBox が自動的に最初のカードを作成します。',
    goToHome: 'ホームへ',
    createDescription: 'ノートを 500–1000 文字の記事に組み合わせ、FB、IG 投稿、ブログに最適。',
    quickStart: '初めてですか？すべて読む必要はありません',
    quickStartDescription: '始めるには、この3つの機能を学びましょう：',
    quickStartStep1: 'ホーム：テキスト/音声の迅速なキャプチャ',
    quickStartStep2: 'カード：カードの閲覧と整理',
    quickStartStep3: 'デイリーインスピレーション：AI 生成の毎日のメッセージを表示',
    goToPage: '移動',
  },
};

export function getTranslation(lang: AppLanguage): Translations {
  return translations[lang] || translations['en'];
}

