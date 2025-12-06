-- Add new fields to vocab_words table for generated word information
ALTER TABLE vocab_words 
ADD COLUMN IF NOT EXISTS pronunciation TEXT,
ADD COLUMN IF NOT EXISTS synonyms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS chinese_translation TEXT;

-- Create index for synonyms search
CREATE INDEX IF NOT EXISTS idx_vocab_words_synonyms ON vocab_words USING GIN(synonyms);

