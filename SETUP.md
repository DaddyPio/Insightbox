# InsightBox Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- An OpenAI API key

## Step 1: Install Dependencies

```bash
cd insightbox
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to **SQL Editor**
3. Copy and paste the contents of `supabase/schema.sql` into the editor
4. Run the SQL to create all tables, indexes, and policies
5. Go to **Settings** → **API** to get:
   - Project URL (use as `NEXT_PUBLIC_SUPABASE_URL`)
   - `anon` public key (use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` key (use as `SUPABASE_SERVICE_ROLE_KEY`) - **Keep this secret!**

## Step 3: Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   OPENAI_API_KEY=sk-your_openai_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Test the App

1. Go to the home page
2. Write a note or use the voice recording feature
3. Submit the note - AI will automatically generate:
   - Title
   - Topic classification
   - Emotion detection
   - Tags
   - Summary
4. View your notes in the Cards page
5. Check out the Weekly Review page for AI-generated insights

## Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and keys are correct
- Check that you've run the SQL schema in Supabase
- Ensure Row Level Security (RLS) policies are set up correctly

### OpenAI API Issues
- Verify your API key is correct
- Check your OpenAI account has credits
- Ensure you have access to GPT-4 and Whisper APIs

### Voice Recording Not Working
- Check browser permissions for microphone access
- Ensure you're using HTTPS (required for microphone access in production)
- Try a different browser if issues persist

## Production Deployment

詳細的部署指南請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 快速部署到 Vercel（推薦）

1. 將代碼推送到 GitHub/GitLab
2. 前往 [vercel.com](https://vercel.com) 並導入項目
3. 設置環境變數（與 `.env.local` 相同）
4. 點擊部署

### 在手機上使用

- **方法 1（推薦）**: 部署到 Vercel，然後在手機瀏覽器訪問 URL
- **方法 2（快速測試）**: 使用 ngrok 讓手機訪問本地服務器

詳細步驟請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## Features

- ✅ Speech-to-text note capture
- ✅ AI-powered title generation
- ✅ Automatic topic classification
- ✅ Emotion detection
- ✅ Smart tag generation
- ✅ AI summaries
- ✅ Related note suggestions
- ✅ Weekly review with insights
- ✅ Wooden-style social image generation

Enjoy capturing your insights! 🎉

