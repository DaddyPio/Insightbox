# VocabularyBank Setup Guide

## Database Setup

1. Run the SQL schema in Supabase:
   ```bash
   # Execute the SQL file in Supabase SQL Editor
   supabase/vocab_words.sql
   ```

2. Create Supabase Storage Bucket:
   - Go to Supabase Dashboard → Storage
   - Create a new bucket named `vocab-audio`
   - Set it to public (or configure RLS policies as needed)

## Environment Variables

No additional environment variables needed. Uses existing Supabase configuration.

## Features

### 1. Capture Mode (`/vocab/capture`)
- Quick capture of new words while driving/listening
- Sound-like spelling input
- Context sentence from podcast/article
- Optional audio recording upload

### 2. Processing Mode (`/vocab/process/[id]`)
- Fill in complete word details:
  - Correct word
  - Definition
  - Part of speech
  - Register (formal/informal/technical)
  - Collocations
  - Work and general sentences
  - Tags
- Auto-generates spaced repetition schedule

### 3. Review Mode (`/vocab/review`)
- Daily review of words scheduled for today
- Three actions:
  - **Know It**: Progress to next review stage
  - **Don't Know**: Reset to tomorrow
  - **Master**: Mark as mastered

### 4. Vocabulary Bank (`/vocab/bank`)
- View all words
- Search by word, meaning, collocations
- Filter by status (inbox/processing/reviewing/mastered)
- Filter by tags
- Click any word to edit/process

## Spaced Repetition Schedule

- Stage 0: Review tomorrow
- Stage 1: +2 days
- Stage 2: +4 days
- Stage 3: +7 days
- Stage 4: +14 days
- Stage 5: Mastered (no more reviews)

## API Routes

- `GET /api/vocab/words` - List words (with filters)
- `POST /api/vocab/words` - Create new word
- `GET /api/vocab/words/[id]` - Get single word
- `PUT /api/vocab/words/[id]` - Update word
- `DELETE /api/vocab/words/[id]` - Delete word
- `POST /api/vocab/words/[id]/review` - Update review status
- `POST /api/vocab/upload` - Upload audio file

## Navigation

The Vocabulary link has been added to the main navigation bar.

