# VocabularyBank 使用指南

## 📋 初始設置

### 1. 設置數據庫

1. 登入 Supabase Dashboard
2. 前往 **SQL Editor**
3. 打開 `supabase/vocab_words.sql` 文件
4. 複製所有 SQL 代碼
5. 在 SQL Editor 中執行這些代碼
6. 確認表已成功創建（應該會看到 `vocab_words` 表）

### 2. 設置音頻存儲桶

1. 在 Supabase Dashboard 中，前往 **Storage**
2. 點擊 **New bucket**
3. 輸入名稱：`vocab-audio`
4. 選擇 **Public bucket**（公開存儲桶）
5. 點擊 **Create bucket**

### 3. 設置存儲桶權限（可選，但推薦）

在 SQL Editor 中執行以下代碼以設置 RLS 策略：

```sql
-- 允許認證用戶上傳音頻
CREATE POLICY "Users can upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vocab-audio');

-- 允許認證用戶讀取音頻
CREATE POLICY "Users can read audio"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'vocab-audio');

-- 允許認證用戶刪除自己的音頻
CREATE POLICY "Users can delete own audio"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vocab-audio' AND (storage.foldername(name))[1] = auth.uid()::text);
```

## 🚀 開始使用

### 第一步：捕獲新單詞

1. 點擊導航欄中的 **Vocabulary**
2. 點擊 **+ New Word** 按鈕
3. 填寫：
   - **Sound-like Spelling**（必填）：輸入你聽到的發音，例如 "uh-bout" 代表 "about"
   - **Context Sentence**（選填）：從播客或文章中聽到的句子
   - **Audio Recording**（選填）：上傳音頻錄音
4. 點擊 **Save**

單詞會以 `inbox` 狀態保存。

### 第二步：處理單詞

1. 在 Vocabulary Bank 中，找到狀態為 **inbox** 的單詞
2. 點擊該單詞卡片
3. 填寫完整信息：
   - **Correct Word**（必填）：正確的單詞拼寫
   - **Definition**（必填）：簡單的英文定義
   - **Part of Speech**：詞性（名詞、動詞等）
   - **Register**：語域（正式、非正式、技術性）
   - **Collocations**：搭配詞（用逗號分隔，例如 "make a decision, take action"）
   - **My Work Sentence**：用這個單詞寫一個工作相關的句子
   - **My General Sentence**：用這個單詞寫一個一般性的句子
   - **Tags**：標籤（用逗號分隔，例如 "meeting, email, interview"）
4. 點擊 **Start Reviewing**

系統會自動生成間隔重複複習計劃，單詞狀態變為 `reviewing`。

### 第三步：每日複習

1. 點擊導航欄中的 **Vocabulary**
2. 點擊 **Review** 按鈕（或直接訪問 `/vocab/review`）
3. 系統會顯示今天需要複習的所有單詞
4. 對每個單詞選擇：
   - **✓ Know It**：表示認識，會進入下一個複習階段
   - **✗ Don't Know**：表示不認識，會重置到明天複習
   - **★ Master**：表示已完全掌握，標記為已掌握

### 第四步：管理詞彙庫

在 **Vocabulary Bank** 頁面，你可以：

- **搜索**：在搜索框中輸入關鍵詞，可以搜索單詞、定義、搭配詞、標籤
- **過濾**：
  - 按狀態過濾：inbox、processing、reviewing、mastered
  - 按標籤過濾：meeting、email、interview 等
- **編輯**：點擊任何單詞卡片可以編輯或處理

## 📅 間隔重複計劃

系統使用以下複習間隔：

- **階段 0**：明天複習
- **階段 1**：+2 天後複習
- **階段 2**：+4 天後複習
- **階段 3**：+7 天後複習
- **階段 4**：+14 天後複習
- **階段 5**：已掌握（不再複習）

每次選擇 "Know It" 時，會自動進入下一個階段。

## 💡 使用技巧

1. **快速捕獲**：開車或聽播客時，快速記錄發音和上下文，稍後再處理
2. **定期處理**：每天花 10-15 分鐘處理 inbox 中的單詞
3. **每日複習**：養成每天複習的習慣，系統會自動安排複習時間
4. **使用標籤**：為單詞添加標籤（如 meeting、email），方便日後分類查找
5. **寫句子**：為每個單詞寫工作句子和一般句子，幫助記憶

## 🔗 快速連結

- **捕獲新單詞**：`/vocab/capture`
- **詞彙庫**：`/vocab/bank`
- **今日複習**：`/vocab/review`
- **處理單詞**：點擊詞彙庫中的單詞卡片

## ❓ 常見問題

**Q: 音頻上傳失敗怎麼辦？**
A: 檢查 Supabase Storage 中的 `vocab-audio` 存儲桶是否已創建，並確認權限設置正確。

**Q: 如何刪除單詞？**
A: 目前需要通過 Supabase Dashboard 手動刪除，或聯繫開發者添加刪除功能。

**Q: 複習計劃可以自定義嗎？**
A: 目前使用固定的間隔重複計劃，未來可能會添加自定義選項。

**Q: 可以導出單詞嗎？**
A: 目前不支持導出功能，但可以通過 Supabase Dashboard 查看所有數據。

---

開始使用 VocabularyBank，建立你的個人英語詞彙庫！📚✨

