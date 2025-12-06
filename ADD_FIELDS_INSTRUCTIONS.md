# 如何在 Supabase 添加新欄位

## 步驟 1：登入 Supabase Dashboard

1. 前往 [https://supabase.com](https://supabase.com)
2. 登入您的帳號
3. 選擇您的 InsightBox 專案

## 步驟 2：打開 SQL Editor

1. 在左側選單中，點擊 **SQL Editor**
2. 點擊 **New query** 按鈕（或使用現有的查詢編輯器）

## 步驟 3：複製並執行 SQL

1. 打開 `supabase/vocab_words_add_fields.sql` 文件
2. 複製以下 SQL 語句：

```sql
-- Add new fields to vocab_words table for generated word information
ALTER TABLE vocab_words 
ADD COLUMN IF NOT EXISTS pronunciation TEXT,
ADD COLUMN IF NOT EXISTS synonyms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS chinese_translation TEXT;

-- Create index for synonyms search
CREATE INDEX IF NOT EXISTS idx_vocab_words_synonyms ON vocab_words USING GIN(synonyms);
```

3. 將 SQL 語句貼到 SQL Editor 中
4. 點擊 **Run** 按鈕（或按 `Ctrl+Enter` / `Cmd+Enter`）

## 步驟 4：確認執行成功

執行成功後，您應該會看到：
- ✅ 成功訊息："Success. No rows returned"
- 或者確認訊息表示欄位已添加

## 步驟 5：驗證欄位已添加（可選）

如果想確認欄位已添加，可以執行以下查詢：

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vocab_words' 
AND column_name IN ('pronunciation', 'synonyms', 'chinese_translation');
```

應該會看到三個欄位的資訊。

## 完成！

現在資料庫已經準備好保存 pronunciation、synonyms 和 chinese_translation 了。

## 如果遇到錯誤

### 錯誤：column already exists
- 這表示欄位已經存在，可以忽略
- SQL 使用了 `IF NOT EXISTS`，所以不會重複添加

### 錯誤：permission denied
- 確認您使用的是正確的 Supabase 專案
- 確認您有管理員權限

### 其他錯誤
- 檢查 SQL 語法是否正確
- 確認表名 `vocab_words` 是否存在

