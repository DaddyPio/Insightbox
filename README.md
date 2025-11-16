# InsightBox

A personal idea-capturing app with AI-powered insights, built with Next.js 14, TypeScript, TailwindCSS, and Supabase.

## Features

- 🎤 Speech-to-text note capture
- 🤖 AI-powered title generation, topic classification, emotion analysis, and tagging
- 📚 Card library with search and filters
- 🔗 AI-suggested related cards
- 📸 Wooden-style social image generation
- 📊 Weekly review with AI-generated insights

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in your Supabase and OpenAI API keys in `.env.local`.

3. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Get your project URL and anon key from Supabase dashboard

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

See `supabase/schema.sql` for the complete database schema.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS (warm wood-tone theme)
- Supabase (database)
- OpenAI API (GPT-4, Whisper)
- html-to-image (social image generation)

