# Resend Email 服務配置指南

本指南將一步一步教您如何配置 Resend 來發送驗證碼 email。

## 步驟 1：註冊 Resend 帳號

1. 前往 [https://resend.com](https://resend.com)
2. 點擊右上角的 **"Sign Up"** 或 **"Get Started"**
3. 使用您的 email 註冊（可以使用 Google/GitHub 登入）
4. 完成註冊後，您會進入 Resend Dashboard

## 步驟 2：獲取 API Key

1. 登入 Resend Dashboard 後，點擊左側選單的 **"API Keys"**
2. 點擊右上角的 **"Create API Key"** 按鈕
3. 填寫 API Key 資訊：
   - **Name**: 輸入一個名稱，例如 "InsightBox Production" 或 "InsightBox Development"
   - **Permission**: 選擇 **"Sending access"**（發送權限）
   - **Domain**: 可以留空（稍後配置）
4. 點擊 **"Add"** 創建 API Key
5. **重要**：複製顯示的 API Key（格式類似 `re_xxxxxxxxxxxxx`）
   - ⚠️ 這個 Key 只會顯示一次，請務必保存好！
   - 如果忘記了，需要刪除舊的 Key 並創建新的

## 步驟 3：配置發送 Email 地址

### 選項 A：使用 Resend 測試域名（快速測試，推薦先用這個）

1. 在 Resend Dashboard 中，點擊左側選單的 **"Domains"**
2. 您會看到一個預設的測試域名：`onboarding@resend.dev`
3. 這個地址可以直接使用，無需額外配置
4. 在環境變數中使用：`RESEND_FROM_EMAIL=onboarding@resend.dev`

### 選項 B：使用自己的域名（生產環境推薦）

1. 在 Resend Dashboard 中，點擊左側選單的 **"Domains"**
2. 點擊 **"Add Domain"** 按鈕
3. 輸入您的域名（例如：`yourdomain.com`）
4. Resend 會提供 DNS 記錄，您需要在您的域名提供商（如 Cloudflare、GoDaddy）中添加這些記錄：
   - SPF 記錄
   - DKIM 記錄
   - DMARC 記錄（可選）
5. 添加 DNS 記錄後，等待驗證（通常幾分鐘到幾小時）
6. 驗證成功後，您可以使用：`RESEND_FROM_EMAIL=noreply@yourdomain.com`

## 步驟 4：配置本地開發環境

1. 打開項目根目錄下的 `.env.local` 文件（如果不存在，複製 `env.local.example` 並重命名）
2. 添加以下兩行：

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

3. 將 `re_your_api_key_here` 替換為您在步驟 2 中獲取的實際 API Key
4. 如果使用自己的域名，將 `onboarding@resend.dev` 替換為您的 email 地址

## 步驟 5：配置 Vercel 生產環境

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的 InsightBox 項目
3. 點擊 **"Settings"** → **"Environment Variables"**
4. 添加以下環境變數：

   - **Name**: `RESEND_API_KEY`
   - **Value**: 您的 Resend API Key（格式：`re_xxxxxxxxxxxxx`）
   - **Environment**: 選擇所有環境（Production, Preview, Development）

   - **Name**: `RESEND_FROM_EMAIL`
   - **Value**: `onboarding@resend.dev`（測試）或 `noreply@yourdomain.com`（生產）
   - **Environment**: 選擇所有環境

5. 點擊 **"Save"** 保存
6. 重新部署應用（Vercel 會自動重新部署，或手動點擊 **"Redeploy"**）

## 步驟 6：測試驗證碼發送

1. 啟動本地開發服務器：
   ```bash
   cd insightbox
   npm run dev
   ```

2. 打開瀏覽器訪問 `http://localhost:3000/login`
3. 輸入您的 email 地址
4. 點擊「發送驗證碼」
5. 檢查您的 email 信箱，應該會收到包含 6 位數驗證碼的 email
6. 如果沒有收到：
   - 檢查垃圾郵件資料夾
   - 查看瀏覽器控制台是否有錯誤訊息
   - 查看終端機的日誌輸出

## 步驟 7：驗證數據庫表已創建

在配置 Resend 之前，請確保已經在 Supabase 中創建了驗證碼表：

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的項目
3. 點擊左側選單的 **"SQL Editor"**
4. 點擊 **"New query"**
5. 複製 `supabase/verification_codes.sql` 文件的全部內容
6. 貼上到 SQL Editor
7. 點擊 **"Run"** 執行
8. 確認看到 "Success. No rows returned" 訊息

## 常見問題

### Q: 免費版有什麼限制？
A: Resend 免費版每月可以發送 3,000 封 email，對於個人項目通常足夠使用。

### Q: 可以使用其他 Email 服務嗎？
A: 可以，但需要修改 `app/api/auth/send-code/route.ts` 中的 email 發送邏輯。Resend 是最簡單的選擇。

### Q: 測試時沒有收到 email？
A: 
- 確認 API Key 正確
- 確認 `RESEND_FROM_EMAIL` 格式正確
- 檢查 Resend Dashboard 的 **"Logs"** 查看發送狀態
- 確認 email 沒有被歸類為垃圾郵件

### Q: 生產環境需要配置自己的域名嗎？
A: 不是必須的，但強烈推薦。使用自己的域名可以提高 email 送達率，避免被標記為垃圾郵件。

## 完成！

配置完成後，您的應用就可以發送包含 6 位數驗證碼的 email 了！

