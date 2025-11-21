// @ts-nocheck
import { openai } from './client';

export type LetterTone = 'warm' | 'honest' | 'story' | 'short';

export interface GenerateLetterOptions {
  rawText: string;
  childName?: string;
  tone?: LetterTone;
  locale?: 'zh-TW' | 'en' | 'ja';
}

export interface GeneratedLetter {
  title: string;
  letter: string;
  summary?: string;
}

const TONE_DESCRIPTIONS = {
  warm: {
    zh: '溫暖鼓勵：用溫和、支持的語氣，充滿愛與鼓勵',
    en: 'Warm and encouraging: gentle, supportive tone, full of love and encouragement',
  },
  honest: {
    zh: '坦誠對話：直接、真實地表達想法，適合需要深入溝通的時刻',
    en: 'Honest talk: direct and authentic expression, suitable for moments needing deep communication',
  },
  story: {
    zh: '故事式分享：用故事或比喻的方式，讓訊息更容易理解和記住',
    en: 'Storytelling: using stories or metaphors to make messages easier to understand and remember',
  },
  short: {
    zh: '簡短提醒：簡潔有力，適合日常的小提醒或鼓勵',
    en: 'Short reminder: concise and powerful, suitable for daily reminders or encouragement',
  },
};

const SYSTEM_PROMPT = `You are helping a Taiwanese dad write warm, encouraging letters to his children in Traditional Chinese. You receive a rough transcript of what he said, and you must rewrite it into a clear, simple, emotionally warm letter, speaking directly from '爸爸' to the child. 

CRITICAL RULES:
- Use friendly, everyday language that an elementary/junior-high kid can understand (ages 6-15)
- Do NOT copy long sentences directly from the raw text. Distill, clarify, and reorganize his thoughts
- Keep the style warm, honest, and grounded, not overly "chicken-soup-like"
- Length: about 150-400 Chinese characters (enough to feel like a real letter, but not too long for a kid)
- Avoid sensitive medical, financial or adult-only topics; if such content exists, soften or generalize it
- Do NOT include any AI meta-commentary like "As an AI..." etc.
- Output JSON ONLY with keys: { "title": string, "letter": string, "summary": string }
- The "title" should be brief (5-10 words), like "給你的一小段話" or "今天想跟你說"
- The "letter" is the full letter content in Traditional Chinese, written from 爸爸 to the child
- The "summary" is a brief 1-sentence summary of what this letter is about (optional, can be empty string)

Structure the letter:
- Opening: gently address the child by name (if provided), e.g. 「親愛的 OO」 or 「給你的一段話」
- Middle: explain 1-2 core ideas in simple, clear language
- Closing: a short, warm ending, e.g. 「不管發生什麼事，爸爸都愛你、站在你這邊。」`;

export async function generateChildLetter(
  options: GenerateLetterOptions
): Promise<GeneratedLetter> {
  if (!openai) {
    throw new Error('OpenAI client is not initialized');
  }

  const { rawText, childName, tone = 'warm', locale = 'zh-TW' } = options;

  const toneDesc = TONE_DESCRIPTIONS[tone]?.[locale === 'zh-TW' ? 'zh' : 'en'] || TONE_DESCRIPTIONS.warm.zh;

  const userPrompt = `Please rewrite the following raw speech transcript into a warm letter from 爸爸 to ${childName ? `his child named "${childName}"` : 'his child'}.

Tone/Style: ${toneDesc}

Raw transcript:
${rawText}

Instructions:
1. Analyze the core message and emotions (care, worry, pride, encouragement, apology, etc.)
2. Distill the key points into 1-2 simple ideas
3. Write a letter in Traditional Chinese using the specified tone
4. Address the child by name if provided, otherwise use 「你」 or 「孩子」
5. Keep it warm, simple, and age-appropriate
6. Output JSON only with title, letter, and summary fields.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_completion_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    let parsed;
    
    try {
      parsed = JSON.parse(raw);
    } catch {
      // If model returned text, try to extract JSON block
      const match = raw.match(/\{[\s\S]*\}$/);
      parsed = match ? JSON.parse(match[0]) : { title: '給你的一小段話', letter: raw, summary: '' };
    }

    return {
      title: parsed.title || '給你的一小段話',
      letter: parsed.letter || raw,
      summary: parsed.summary || '',
    };
  } catch (error: any) {
    console.error('Error generating child letter:', error);
    throw new Error(`Failed to generate letter: ${error?.message || 'Unknown error'}`);
  }
}

