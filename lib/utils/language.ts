/**
 * Detect if text is Chinese (Traditional or Simplified)
 */
export function isChinese(text: string): boolean {
  // Check for Chinese characters (CJK Unified Ideographs)
  const chineseRegex = /[\u4e00-\u9fff]/;
  return chineseRegex.test(text);
}

/**
 * Detect if text is Japanese
 */
export function isJapanese(text: string): boolean {
  // Check for Hiragana, Katakana, or Kanji with Japanese-specific patterns
  const hiraganaRegex = /[\u3040-\u309f]/;
  const katakanaRegex = /[\u30a0-\u30ff]/;
  const kanjiRegex = /[\u4e00-\u9faf]/;
  
  // If contains Hiragana or Katakana, it's likely Japanese
  if (hiraganaRegex.test(text) || katakanaRegex.test(text)) {
    return true;
  }
  
  // If contains Kanji, check for Japanese-specific patterns
  if (kanjiRegex.test(text)) {
    // Japanese often uses specific particles and patterns
    const japaneseParticles = /[のをにでがはと]/;
    return japaneseParticles.test(text);
  }
  
  return false;
}

/**
 * Detect if text is primarily English
 */
export function isEnglish(text: string): boolean {
  // Check if text contains mostly English characters
  const englishRegex = /^[a-zA-Z0-9\s\.,!?'"\-:;()\[\]{}]+$/;
  const chineseRegex = /[\u4e00-\u9fff]/;
  const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/;
  
  // If contains Chinese or Japanese, it's not English
  if (chineseRegex.test(text) || japaneseRegex.test(text)) {
    return false;
  }
  
  // Check if mostly English characters
  const englishChars = text.match(/[a-zA-Z]/g)?.length || 0;
  const totalChars = text.replace(/\s/g, '').length;
  
  return totalChars > 0 && englishChars / totalChars > 0.5;
}

/**
 * Detect language of text
 */
export function detectLanguage(text: string): 'zh-TW' | 'en' | 'ja' {
  if (isJapanese(text)) {
    return 'ja';
  }
  if (isChinese(text)) {
    return 'zh-TW';
  }
  return 'en';
}

