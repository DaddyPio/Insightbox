import { NextRequest, NextResponse } from 'next/server';
import { supabaseFromRequest } from '@/lib/supabase/serverUser';
import { openai } from '@/lib/openai/client';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseFromRequest(request);
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the word first
    const { data: word, error: fetchError } = await supabase
      .from('vocab_words')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    // Get the word to generate info for (use correct_word if available, otherwise sound_like)
    const wordToGenerate = word.correct_word || word.sound_like;
    if (!wordToGenerate) {
      return NextResponse.json({ error: 'No word provided' }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI is not configured' },
        { status: 500 }
      );
    }

    // Generate word information using OpenAI
    const prompt = `You are an English vocabulary expert. Generate comprehensive information for the word: "${wordToGenerate}"

${word.context_sentence ? `Context sentence: "${word.context_sentence}"` : ''}

Please provide the following information in JSON format:
{
  "definition": "English definition (simple, clear explanation in English)",
  "pronunciation": "IPA pronunciation (e.g., /ˈwɜːrd/)",
  "part_of_speech": "noun/verb/adjective/adverb/preposition/conjunction/interjection",
  "collocations": ["common collocation 1", "common collocation 2", "common collocation 3"],
  "synonyms": ["synonym 1", "synonym 2", "synonym 3"],
  "chinese_translation": "簡單的中文翻譯",
  "example_sentences": [
    "Example sentence 1 (daily life context)",
    "Example sentence 2 (work context)",
    "Example sentence 3 (general context)"
  ],
  "register": "formal/informal/technical/neutral"
}

Requirements:
- Definition should be clear and easy to understand
- Pronunciation in IPA format
- Collocations should be common, practical phrases
- Synonyms should be relevant and commonly used
- Chinese translation should be simple and accurate
- Example sentences should be natural and practical
- Register should indicate the formality level

Return ONLY valid JSON, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an English vocabulary expert. Always return valid JSON only, no additional text.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate word information' },
        { status: 500 }
      );
    }

    let wordInfo;
    try {
      wordInfo = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse generated information' },
        { status: 500 }
      );
    }

    // Update the word with generated information
    const updateData: any = {
      definition: wordInfo.definition || word.definition,
      part_of_speech: wordInfo.part_of_speech || word.part_of_speech,
      collocations: wordInfo.collocations || word.collocations || [],
      register: wordInfo.register || word.register,
    };

    // If correct_word is not set, set it
    if (!word.correct_word && wordToGenerate) {
      updateData.correct_word = wordToGenerate;
    }

    // Update context sentence if we have example sentences
    if (wordInfo.example_sentences && wordInfo.example_sentences.length > 0) {
      if (!word.context_sentence) {
        updateData.context_sentence = wordInfo.example_sentences[0];
      }
      // Set my_general_sentence from example sentences
      if (!word.my_general_sentence && wordInfo.example_sentences.length > 0) {
        updateData.my_general_sentence = wordInfo.example_sentences[0];
      }
      // Set my_work_sentence if we have work context example
      if (!word.my_work_sentence && wordInfo.example_sentences.length > 1) {
        updateData.my_work_sentence = wordInfo.example_sentences[1];
      }
    }

    const { data: updatedWord, error: updateError } = await supabase
      .from('vocab_words')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating word:', updateError);
      return NextResponse.json(
        { error: 'Failed to update word' },
        { status: 500 }
      );
    }

    // Return both the generated info and updated word
    return NextResponse.json({
      wordInfo: {
        definition: wordInfo.definition,
        pronunciation: wordInfo.pronunciation,
        part_of_speech: wordInfo.part_of_speech,
        collocations: wordInfo.collocations || [],
        synonyms: wordInfo.synonyms || [],
        chinese_translation: wordInfo.chinese_translation,
        example_sentences: wordInfo.example_sentences || [],
        register: wordInfo.register,
      },
      word: updatedWord,
    });
  } catch (error: any) {
    console.error('Error in POST /api/vocab/words/[id]/generate:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

