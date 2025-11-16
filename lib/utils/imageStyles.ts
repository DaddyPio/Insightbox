/**
 * Image style definitions for share images
 */

export type ImageStyle = 'wooden' | 'minimal' | 'modern' | 'elegant' | 'bold';

export interface StyleConfig {
  name: string;
  nameZh: string;
  nameJa: string;
  description: string;
  descriptionZh: string;
  descriptionJa: string;
  background: string;
  borderColor: string;
  textColor: string;
  titleColor: string;
  tagBg: string;
  tagText: string;
  quoteIcon: string;
  decorativeLine: string;
}

export const imageStyles: Record<ImageStyle, StyleConfig> = {
  wooden: {
    name: 'Wooden',
    nameZh: '木質風格',
    nameJa: '木質スタイル',
    description: 'Warm wooden texture with classic feel',
    descriptionZh: '溫暖的木質質感，經典風格',
    descriptionJa: '温かみのある木質の質感、クラシックなスタイル',
    background: 'linear-gradient(135deg, rgba(212, 196, 168, 0.9) 0%, rgba(184, 160, 130, 0.9) 100%), url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'wood\' x=\'0\' y=\'0\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'%3E%3Crect fill=\'%23d4c4a8\' width=\'100\' height=\'100\'/%3E%3Cpath d=\'M0 50 Q25 40, 50 50 T100 50\' stroke=\'%23b8a082\' stroke-width=\'1\' fill=\'none\' opacity=\'0.3\'/%3E%3Cpath d=\'M0 30 Q25 20, 50 30 T100 30\' stroke=\'%23b8a082\' stroke-width=\'1\' fill=\'none\' opacity=\'0.2\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill=\'url(%23wood)\' width=\'100\' height=\'100\'/%3E%3C/svg%3E")',
    borderColor: '#725842',
    textColor: '#4f3d30',
    titleColor: '#5f4938',
    tagBg: '#725842',
    tagText: '#faf8f5',
    quoteIcon: '&ldquo;',
    decorativeLine: '#8a6b4f',
  },
  minimal: {
    name: 'Minimal',
    nameZh: '極簡風格',
    nameJa: 'ミニマルスタイル',
    description: 'Clean and simple design',
    descriptionZh: '簡潔清爽的設計',
    descriptionJa: 'クリーンでシンプルなデザイン',
    background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    borderColor: '#e0e0e0',
    textColor: '#333333',
    titleColor: '#1a1a1a',
    tagBg: '#f0f0f0',
    tagText: '#666666',
    quoteIcon: '"',
    decorativeLine: '#cccccc',
  },
  modern: {
    name: 'Modern',
    nameZh: '現代風格',
    nameJa: 'モダンスタイル',
    description: 'Bold and contemporary',
    descriptionZh: '大膽現代的設計',
    descriptionJa: '大胆で現代的なデザイン',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderColor: '#4c51bf',
    textColor: '#ffffff',
    titleColor: '#f7fafc',
    tagBg: 'rgba(255, 255, 255, 0.2)',
    tagText: '#ffffff',
    quoteIcon: '"',
    decorativeLine: 'rgba(255, 255, 255, 0.5)',
  },
  elegant: {
    name: 'Elegant',
    nameZh: '優雅風格',
    nameJa: 'エレガントスタイル',
    description: 'Sophisticated and refined',
    descriptionZh: '精緻優雅的設計',
    descriptionJa: '洗練された上品なデザイン',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    borderColor: '#a0aec0',
    textColor: '#2d3748',
    titleColor: '#1a202c',
    tagBg: '#718096',
    tagText: '#ffffff',
    quoteIcon: '&ldquo;',
    decorativeLine: '#a0aec0',
  },
  bold: {
    name: 'Bold',
    nameZh: '大膽風格',
    nameJa: '大胆スタイル',
    description: 'Vibrant and eye-catching',
    descriptionZh: '鮮明醒目的設計',
    descriptionJa: '鮮やかで目を引くデザイン',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    borderColor: '#e53e3e',
    textColor: '#ffffff',
    titleColor: '#fed7d7',
    tagBg: 'rgba(255, 255, 255, 0.3)',
    tagText: '#ffffff',
    quoteIcon: '"',
    decorativeLine: 'rgba(255, 255, 255, 0.6)',
  },
};

