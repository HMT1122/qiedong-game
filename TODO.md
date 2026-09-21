# TODO — 後續優化清單

> **按優先級排序**。大人可決定哪些先做。

---

## 🔴 P0 — 必須做(影響基本功能)

### 1. DialogSystem.show 改為真的等 typewriter 完成
**現狀**:`DialogSystem.show` 直接 `return Promise.resolve()`,不等打字機跑完。導致 `await showDialog(...)` 立刻往下跑,破壞了關卡節奏(玩家還沒看完對話就跳下一關)。

**修正**:
```javascript
// DialogSystem.js show() 末尾
return new Promise(resolve => {
    const onComplete = () => {
        this.currentTypewriter = null;
        if (options.onComplete) options.onComplete();
        resolve();
    };
    // ... 等 typewriter 完成 callback
});
```

**影響**:Level3 phase intro、Level4 答題、Level5 拖曳,所有用 showDialog 的地方都會更流暢。

### 2. 音效按鈕與暫停按鈕接上 audioSystem
**現狀**:`#audio-toggle` 與 `#pause-btn` 兩個按鈕沒接 audioSystem.toggle() / game.pause() 邏輯。

**修正**:`bindGlobalUI` 內加 listener。

**影響**:學生無法靜音或暫停,教室使用會被老師抱怨。

---

## 🟠 P1 — 強烈建議做(提升體驗)

### 3. 行動裝置觸控精度調優
- Level5 拖曳區域在小螢幕(320x568 iPhone SE)上 drop-zone 太小
- 解法:用 viewport vmin/vmax 重新計算 drop-zone 位置
- 或:支援「點擊式」(點 drop-zone 直接觸發 onDropSuccess)

### 4. PWA Service Worker 離線快取
**現狀**:有 manifest.json 但沒有 service-worker.js
**修正**:加 sw.js,預先 cache index.html + 所有 .js + .css + .svg
**影響**:教室網路不穩時仍可玩

### 5. 結算畫面「再玩一次 / 分享」按鈕接線
**現狀**:EndingScene.render 內有「再玩一次」與「分享」按鈕,但沒接 changeScene 邏輯
**修正**:onPlayAgain → game.resetProgress + changeScene('intro');onShare → navigator.share 或複製連結

### 6. 錯誤選項觸發 Modal 警示動畫
**現狀**:危險選項點下去只播音效+小叮嚀,沒強制重選機制
**修正**:Modal 顯示「危險！」+ 「再做一次」按鈕 → reset 該題

### 7. 實況照片拍攝與替換
**待辦**:等大人安排茄苳國小校門口、附近道路、校車、站牌拍照,按 PHOTO_REPLACEMENT_SOP.md 替換。

---

## 🟡 P2 — 加分項(未來迭代)

### 8. 多語言切換
**現狀**:全中文硬寫在 dialogs.js
**修正**:抽 i18n key + 載入 zh-TW.json / en.json

### 9. 角色自訂(選擇不同頭像/衣服)
**現狀**:只有一個「茄冬寶寶」SVG
**修正**:加 character select 畫面,可選 3-4 種造型

### 10. 家長後台(查看孩子答題正確率)
**現狀**:只有星星數
**修正**:加 PIN 碼保護的家長模式,記錄每題正確與否的時間戳

### 11. Google Analytics / 流量統計
**現狀**:無
**修正**:加 GA4,看每關完成率/重玩率

### 12. 音效庫擴充
**現狀**:5 種音效
**修正**:加 過關掌聲、加油聲、腳步聲

### 13. Level3 Canvas 死角動畫優化
**現狀**:紅色半透明矩形 + 扇形
**修正**:用 requestAnimationFrame 平滑動畫,加上箭頭標示方向

### 14. 整合進桃園市府教育平台
**待辦**:聯繫桃園市政府教育局,看是否能 embeded 進「桃園市交通安全扎根教育」官網

### 15. 印證書/獎狀
**現狀**:結局只顯示星星數
**修正**:加上「交通小達人」證書,可列印或下載 PDF

---

## 🟢 P3 — Nice to have

- 加上家長信箱回饋表單
- 加上「同學一起玩」多人模式(同裝置輪流作答)
- 加上「考前衝刺」快問快答模式
- 加 SRS (Spaced Repetition) 重點關卡優先推播
- 加上成就徽章(完美主義 / 快速通關 / 全對 / 無錯誤)

---

## 📝 已知技術債

### Code Smells
- `Scene.js` 基類的 `bindEvents/unbindEvents` 設計太通用,部分子類別(尤其 Level4/5)用匿名 closure,unbind 時難清掉
- `Main.js` 用 130 行的 `init()` function,沒拆模組
- `dialogs.js` 100+ 字串常數,可改為分類物件

### 技術債
- 沒有 unit test(場景切換邏輯很值得測)
- 沒有 ESLint / Prettier
- 沒有 CI/CD (GitHub Actions 自動部署到 Pages)

### 文件待補
- 各 Scene 的 JSDoc 註解
- AudioSystem 波形參數表說明
- GameEngine 狀態機流程圖

---

## 🎯 短期 Roadmap(給大人看)

| 時程 | 目標 |
|------|------|
| Week 1 (09-25 前) | 修 P0 + 加實況照片 + GitHub Pages 上線 |
| Week 2 (10-02 前) | 桃園市府審查 + 學生試玩回饋修正 |
| Week 3-4 (10-15 前) | P1 完成(PWA + 結算) |
| Month 2 | P2 + 加 i18n + 家長後台 |
| Month 3 | 整合進桃園教育平台 + 證書列印 |