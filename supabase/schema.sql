-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  topic TEXT,
  emotion TEXT,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relationships table for related notes
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  related_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(note_id, related_note_id)
);

-- Weekly insights table
CREATE TABLE IF NOT EXISTS weekly_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week DATE NOT NULL,
  summary TEXT,
  insights JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(week)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_topic ON notes(topic);
CREATE INDEX IF NOT EXISTS idx_notes_emotion ON notes(emotion);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_relationships_note_id ON relationships(note_id);
CREATE INDEX IF NOT EXISTS idx_relationships_related_note_id ON relationships(related_note_id);
CREATE INDEX IF NOT EXISTS idx_weekly_insights_week ON weekly_insights(week DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_insights_updated_at BEFORE UPDATE ON weekly_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users
-- Note: Adjust these policies based on your authentication requirements
CREATE POLICY "Allow all for authenticated users" ON notes
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON relationships
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON weekly_insights
  FOR ALL USING (true);

