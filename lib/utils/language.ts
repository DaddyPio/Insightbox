/**
 * Detect if text is Chinese (Traditional or Simplified)
 */
export function isChinese(text: string): boolean {
  // Check for Chinese characters (CJK Unified Ideographs)
  const chineseRegex = /[\u4e00-\u9fff]/;
  return chineseRegex.test(text);
}

/**
 * Detect if text is primarily English
 */
export function isEnglish(text: string): boolean {
  // Check if text contains mostly English characters
  const englishRegex = /^[a-zA-Z0-9\s\.,!?'"\-:;()\[\]{}]+$/;
  const chineseRegex = /[\u4e00-\u9fff]/;
  
  // If contains Chinese, it's not English
  if (chineseRegex.test(text)) {
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
export function detectLanguage(text: string): 'zh-TW' | 'en' {
  if (isChinese(text)) {
    return 'zh-TW';
  }
  return 'en';
}

