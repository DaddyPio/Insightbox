-- Create table for vocabulary words
CREATE TABLE IF NOT EXISTS vocab_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sound_like TEXT,
  correct_word TEXT,
  definition TEXT,
  context_sentence TEXT,
  my_work_sentence TEXT,
  my_general_sentence TEXT,
  collocations TEXT[] DEFAULT '{}',
  part_of_speech TEXT,
  register TEXT,
  tags TEXT[] DEFAULT '{}',
  audio_url TEXT,
  status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'processing', 'reviewing', 'mastered')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  next_review_date DATE,
  review_stage INTEGER DEFAULT 0 CHECK (review_stage >= 0 AND review_stage <= 5)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vocab_words_user_id ON vocab_words(user_id);
CREATE INDEX IF NOT EXISTS idx_vocab_words_status ON vocab_words(status);
CREATE INDEX IF NOT EXISTS idx_vocab_words_next_review_date ON vocab_words(next_review_date);
CREATE INDEX IF NOT EXISTS idx_vocab_words_tags ON vocab_words USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_vocab_words_collocations ON vocab_words USING GIN(collocations);

-- Enable RLS
ALTER TABLE vocab_words ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own words
DROP POLICY IF EXISTS "Users can view own vocab words" ON vocab_words;
CREATE POLICY "Users can view own vocab words" ON vocab_words
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own words
DROP POLICY IF EXISTS "Users can insert own vocab words" ON vocab_words;
CREATE POLICY "Users can insert own vocab words" ON vocab_words
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own words
DROP POLICY IF EXISTS "Users can update own vocab words" ON vocab_words;
CREATE POLICY "Users can update own vocab words" ON vocab_words
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own words
DROP POLICY IF EXISTS "Users can delete own vocab words" ON vocab_words;
CREATE POLICY "Users can delete own vocab words" ON vocab_words
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vocab_words_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_vocab_words_updated_at ON vocab_words;
CREATE TRIGGER update_vocab_words_updated_at
  BEFORE UPDATE ON vocab_words
  FOR EACH ROW
  EXECUTE FUNCTION update_vocab_words_updated_at();

