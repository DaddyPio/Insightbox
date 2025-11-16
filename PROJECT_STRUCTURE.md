# InsightBox Project Structure

```
insightbox/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API routes
│   │   ├── notes/
│   │   │   ├── route.ts          # GET/POST all notes
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET single note
│   │   │       └── related/
│   │   │           └── route.ts  # GET related notes
│   │   ├── transcribe/
│   │   │   └── route.ts          # POST audio transcription
│   │   ├── weekly/
│   │   │   └── route.ts          # GET weekly insights
│   │   └── share/
│   │       └── [id]/
│   │           └── route.ts      # GET share data
│   ├── card/
│   │   └── [id]/
│   │       └── page.tsx          # Single card view
│   ├── cards/
│   │   └── page.tsx              # Card library with filters
│   ├── share/
│   │   └── [id]/
│   │       └── page.tsx          # Share image generator
│   ├── weekly/
│   │   └── page.tsx              # Weekly review page
│   ├── globals.css               # Global styles + Tailwind
│   ├── layout.tsx                # Root layout with navigation
│   └── page.tsx                  # Home page with note input
│
├── components/                   # Reusable components
│   ├── NoteCard.tsx              # Card component for note display
│   └── SpeechToTextButton.tsx    # Voice recording component
│
├── lib/                          # Utility libraries
│   ├── openai/
│   │   ├── client.ts             # OpenAI client setup
│   │   ├── prompts.ts            # AI prompt templates
│   │   └── utils.ts              # AI utility functions
│   └── supabase/
│       ├── client.ts             # Client-side Supabase client
│       ├── server.ts             # Server-side Supabase client
│       └── types.ts              # TypeScript database types
│
├── supabase/
│   └── schema.sql                # Database schema
│
├── .env.local.example            # Environment variables template
├── .eslintrc.json                # ESLint configuration
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.mjs            # PostCSS configuration
├── README.md                     # Project overview
├── SETUP.md                      # Setup instructions
├── tailwind.config.ts            # TailwindCSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## Key Features by File

### API Routes
- **`/api/notes`**: Create and list notes with AI processing
- **`/api/notes/[id]`**: Get individual note
- **`/api/notes/[id]/related`**: Get AI-suggested related notes
- **`/api/transcribe`**: Convert audio to text using Whisper
- **`/api/weekly`**: Generate weekly insights
- **`/api/share/[id]`**: Get note data for sharing

### Pages
- **`/`**: Home page with note input and speech-to-text
- **`/cards`**: Card library with search and filters
- **`/card/[id]`**: Individual note view with AI summary and related notes
- **`/share/[id]`**: Generate wooden-style social media images
- **`/weekly`**: Weekly review with AI-generated insights

### Components
- **`NoteCard`**: Reusable card component for displaying notes
- **`SpeechToTextButton`**: Voice recording and transcription UI

### Libraries
- **`lib/openai`**: All OpenAI API interactions (GPT-4, Whisper)
- **`lib/supabase`**: Database client and type definitions

## Database Schema

### Tables
1. **`notes`**: Main notes table with AI-generated metadata
2. **`relationships`**: Links between related notes
3. **`weekly_insights`**: Cached weekly review data

### Indexes
- Optimized for common queries (created_at, topic, emotion, tags)

## Styling

- **TailwindCSS** with custom warm wood-tone theme
- Custom color palette in `tailwind.config.ts`
- Reusable component classes in `globals.css`

