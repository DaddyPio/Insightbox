# InsightBox 部署指南

## 方法一：部署到 Vercel（推薦，最簡單）

Vercel 是 Next.js 的官方推薦平台，提供免費的 HTTPS 和全球 CDN。

### 步驟 1：準備代碼

1. 確保代碼已提交到 Git（GitHub、GitLab 等）
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

### 步驟 2：部署到 Vercel

1. 前往 [vercel.com](https://vercel.com) 並註冊/登入
2. 點擊 "Add New Project"
3. 導入你的 Git 倉庫
4. 配置項目：
   - **Framework Preset**: Next.js（自動檢測）
   - **Root Directory**: `insightbox`（如果倉庫根目錄不是 insightbox）
5. 設置環境變數：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`（部署後會自動生成）
6. 點擊 "Deploy"

### 步驟 3：更新環境變數

部署完成後，Vercel 會給你一個 URL（例如：`https://insightbox.vercel.app`）

1. 在 Vercel 項目設置中，更新 `NEXT_PUBLIC_APP_URL` 為你的實際 URL
2. 重新部署（或等待自動重新部署）

### 步驟 4：在手機上使用

- 在手機瀏覽器中訪問你的 Vercel URL
- 可以添加到主屏幕（iOS Safari：分享 → 加入主畫面；Android Chrome：選單 → 加入主畫面）

---

## 方法二：使用 ngrok（快速測試，無需部署）

適合快速測試，讓手機訪問本地開發服務器。

### 步驟 1：安裝 ngrok

1. 前往 [ngrok.com](https://ngrok.com) 註冊並下載
2. 或使用 npm 安裝：
   ```bash
   npm install -g ngrok
   ```

### 步驟 2：啟動開發服務器

```bash
cd insightbox
npm run dev
```

### 步驟 3：啟動 ngrok

在新的終端窗口中：
```bash
ngrok http 3000
```

### 步驟 4：在手機上使用

1. ngrok 會顯示一個 URL（例如：`https://abc123.ngrok.io`）
2. 在手機瀏覽器中訪問這個 URL
3. **注意**：免費版 ngrok URL 每次重啟都會改變

---

## 方法三：部署到其他平台

### Netlify

1. 前往 [netlify.com](https://netlify.com)
2. 連接 Git 倉庫
3. 構建設置：
   - Build command: `cd insightbox && npm run build`
   - Publish directory: `insightbox/.next`
4. 設置環境變數
5. 部署

### Railway

1. 前往 [railway.app](https://railway.app)
2. 從 Git 倉庫創建新項目
3. 設置環境變數
4. 部署

---

## 重要配置

### 1. 更新 Supabase RLS 策略（如果需要）

如果部署後無法訪問數據，可能需要更新 Supabase 的 RLS 策略：

1. 前往 Supabase Dashboard → Authentication → Policies
2. 確認策略允許從你的生產域名訪問

### 2. 環境變數設置

確保在部署平台設置以下環境變數：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=https://your-deployed-url.com
```

### 3. HTTPS 要求

- 語音錄製功能需要 HTTPS
- Vercel、Netlify 等平台自動提供 HTTPS
- 如果使用自定義域名，確保配置了 SSL 證書

---

## 分享給朋友

### 方法 1：直接分享 URL

1. 部署完成後，將你的應用 URL 分享給朋友
2. 他們可以直接在瀏覽器中訪問

### 方法 2：創建分享頁面

應用已經有分享功能：
- 每個 note 都有分享頁面：`https://your-app.com/share/[note-id]`
- 可以生成分享圖片

### 方法 3：多用戶支持（需要額外開發）

目前應用是單用戶的。如果要支持多用戶：
1. 添加用戶認證（Supabase Auth）
2. 更新 RLS 策略以支持多用戶
3. 每個用戶只能看到自己的 notes

---

## 手機使用體驗優化

### 添加到主屏幕

**iOS (Safari):**
1. 打開應用
2. 點擊分享按鈕
3. 選擇 "加入主畫面"

**Android (Chrome):**
1. 打開應用
2. 點擊選單（三個點）
3. 選擇 "加入主畫面" 或 "安裝應用"

### PWA 支持（可選）

可以將應用配置為 PWA（Progressive Web App），提供更好的手機體驗：
- 離線支持
- 應用圖標
- 全屏體驗

---

## 成本估算

### 免費方案

- **Vercel**: 免費（適合個人項目）
- **Supabase**: 免費層（500MB 數據庫，2GB 帶寬）
- **OpenAI API**: 按使用量付費（約 $0.01-0.10 每 1000 tokens）

### 預估月成本

- 小規模使用（每天 10-20 個 notes）：約 $5-10/月
- 中等使用（每天 50-100 個 notes）：約 $20-50/月

---

## 故障排除

### 部署後無法訪問

1. 檢查環境變數是否正確設置
2. 確認 Supabase RLS 策略允許訪問
3. 檢查 Vercel 部署日誌

### 手機上無法錄音

1. 確認使用 HTTPS（不是 HTTP）
2. 檢查瀏覽器權限（允許麥克風訪問）
3. 嘗試不同的瀏覽器

### API 錯誤

1. 確認環境變數在部署平台正確設置
2. 檢查 API key 是否有效
3. 查看部署平台的日誌

---

## 推薦部署流程

1. **開發階段**: 使用 `npm run dev` 在本地開發
2. **測試階段**: 使用 ngrok 在手機上測試
3. **生產部署**: 部署到 Vercel 並分享給朋友

