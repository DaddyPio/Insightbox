# 手機上清除 PWA 緩存的方法

如果手機上看不到新的 Vocabulary 功能，請按照以下步驟清除緩存：

## 方法一：清除瀏覽器緩存（推薦）

### Android Chrome：
1. 打開 Chrome 瀏覽器
2. 點擊右上角的三個點（選單）
3. 選擇「設定」
4. 點擊「隱私權和安全性」
5. 點擊「清除瀏覽資料」
6. 選擇「快取圖片和檔案」
7. 時間範圍選擇「全部時間」
8. 點擊「清除資料」

### iOS Safari：
1. 打開「設定」App
2. 向下滾動找到「Safari」
3. 點擊「清除瀏覽記錄和網站資料」
4. 確認清除

## 方法二：重新安裝 PWA

### Android：
1. 長按桌面上的 InsightBox 圖標
2. 選擇「解除安裝」或「移除」
3. 重新打開瀏覽器，訪問網站
4. 重新「加入主畫面」

### iOS：
1. 長按桌面上的 InsightBox 圖標
2. 選擇「移除 App」
3. 重新打開 Safari，訪問網站
4. 重新「加入主畫面」

## 方法三：強制刷新（最快）

### Android Chrome：
1. 打開 InsightBox PWA
2. 按「返回」鍵退出到瀏覽器
3. 在地址欄輸入網址
4. 長按「重新載入」按鈕
5. 選擇「清除快取並強制重新載入」

### iOS Safari：
1. 打開 InsightBox PWA
2. 按「返回」鍵退出到 Safari
3. 在地址欄輸入網址
4. 長按「重新載入」按鈕
5. 選擇「重新載入而不使用快取內容」

## 方法四：清除 Service Worker（進階）

如果以上方法都不行，可以手動清除 Service Worker：

### Android Chrome：
1. 打開 Chrome
2. 在地址欄輸入：`chrome://serviceworker-internals/`
3. 找到 `insightbox-seven.vercel.app` 的 Service Worker
4. 點擊「Unregister」按鈕
5. 重新訪問網站

### iOS Safari：
1. 打開「設定」App
2. 選擇「Safari」
3. 點擊「進階」
4. 點擊「網站資料」
5. 找到並刪除 `insightbox-seven.vercel.app` 的資料

## 驗證更新

清除緩存後：
1. 重新訪問網站
2. 檢查導航欄是否出現「Vocabulary」連結
3. 如果還是沒有，等待 1-2 分鐘讓 Vercel 完成部署
4. 再次嘗試清除緩存

## 如果仍然無法看到

請確認：
- ✅ Vercel 部署已完成（檢查 Vercel Dashboard）
- ✅ 使用的是最新版本的網站（不是本地開發版本）
- ✅ 網路連接正常
- ✅ 已清除所有緩存

如果問題持續，請聯繫開發者。

