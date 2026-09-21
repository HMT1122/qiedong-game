# PROGRESS — 開發過程記錄

> **完整開發歷程**:從 2026-09-19 第一行程式碼到 2026-09-20 全部跑通。

---

## 📅 開發日誌

### 2026-09-19 (Day 1) — 從零到第一版

#### Phase 1: 專案啟動
- 建立 `/home/hermes/qiedong-game/` 專案目錄結構
- 設計資料夾結構:`assets/images/{bg,objects}` / `css/` / `js/{scenes,systems,utils,data}` / `data/`

#### Phase 2: 規格書
- 撰寫 `SPEC.md` (171 行):詳細技術規格 + 5 關卡設計 + 角色設定 + 音效清單

#### Phase 3: 核心骨架
- `index.html` — PWA 入口 + Loading 遮罩 + canvas
- `manifest.json` + 8 種 PWA icon SVG
- `css/main.css` `css/scenes.css` `css/animations.css` — 30+ CSS 動畫

#### Phase 4: 遊戲引擎
- `GameEngine.js` — 場景切換核心 (changeScene/cache)
- `AudioSystem.js` — Web Audio API 純波形合成 (零音檔依賴)
- `StateManager.js` — LocalStorage 進度存檔 + 關卡解鎖
- `InputManager.js` — Touch/Keyboard/Mouse 三合一輸入

#### Phase 5: 工具層
- `AssetLoader.js` — SVG/CSS lazy load
- `TTS.js` — Web Speech API 中文語音
- `DialogSystem.js` — 對話框 + 打字機效果
- `ModalSystem.js` — 警示彈窗
- `ToastSystem.js` — 簡訊提示

#### Phase 6: 場景
- `Scene.js` 基類 + 9 個場景(Intro/Menu/Level1-5/Ending/Parent)
- `dialogs.js` 所有中文字幕與語音台詞

#### Phase 7: SVG 資產
- 9 個 SVG 場景背景(校門口/校園/道路/站牌/校車/車廂/到站/結局/親子)
- 3 個候車位置元件(安全/危險1/危險2)
- 校車/汽車 vector graphics

---

### 2026-09-19 (晚間) — Debug 大作戰

#### Bug 1: Loading 卡死崩潰
**症狀**:打開頁面 → Loading 100% → 黑屏 → 完全沒反應
**原因**:`GameEngine.changeScene` 在 `await sceneInstance.onEnter()` 之前就呼叫 `canvas.appendChild(sceneInstance.element)`,但 element 在 Scene 基類 onEnter 內才 createElement → **appendChild(null) → TypeError**
**修正**:在 appendChild 前先 `if (!sceneInstance.element) sceneInstance.createElement()`

#### Bug 2: 點擊無反應 (更隱晦)
**症狀**:修完 Bug 1 後能進入主選單,但點關卡按鈕沒反應,sceneName 永遠是 menu
**原因**:Scene 基類 `onEnter` 順序錯了:
```
原本:createElement() → bindEvents() → onEnterAsync()
但子類別的 render() 寫在 onEnterAsync() 內!
→ bindEvents 時 element 是空 div,沒有任何按鈕 DOM
→ 綁定的 listener 全部指向不存在元素
```
**修正**:改為 `render() → bindEvents() → onEnterAsync()`,並移除所有 Scene 子類別 onEnterAsync 內重複的 this.render()

#### Bug 3: Level4 卡住過不了關
**症狀**:Level4 點完 4 個行為後,sceneName 永遠是 level4
**原因**:`if (this.correctCount === 3)` 但實際只有 1 個正確(安靜坐好)
**修正**:改為 `if (this.answered.size === 4)`

#### Bug 4: Level5 拖曳失效
**症狀**:拖曳 role 在瀏覽器上沒反應,style.left/top 設了沒用
**原因**:`.drag-target` CSS 沒設 `position: absolute`,所以 absolute 定位失效
**修正**:CSS 加 `position: absolute`

#### Bug 5: Level5 危險區覆蓋安全區
**症狀**:玩家拖到安全區(綠色勾)卻觸發危險區(紅色叉)
**原因**:danger-back zone (top:30%; right:10%) 跟 safe zone (top:20%; right:15%) 部分重疊,且 zones 陣列 danger 在 safe 後面,後覆蓋前
**修正**:checkDropZone 加入 safeMatched 旗標,一旦 match safe 就不再被 danger 覆蓋

---

### 2026-09-20 (Day 2) — 測試 + 文件

#### 完整流程測試
- ✅ 開場動畫 → 點開始上學 → 主選單 (5 關卡鎖定/解鎖正確)
- ✅ Level1: 走在人行道 → 過關 → 1 顆星
- ✅ Level2: 安全候車區 → 過關 → 2 顆星
- ✅ Level3: 等車停穩 → 依序排隊 → 過關 → 4 顆星
- ✅ Level4: 4 個行為 (1 對 + 3 錯) → 過關 → 5 顆星
- ✅ Level5: 等車停穩 → 排隊下車 → 拖曳到安全區 → ending

#### 程式碼清理
- 移除 Level1Scene.debug console.log
- 移除 IntroScene.debug console.log
- 移除 main.js [INIT] debug console.log
- Scene.getDialog 加 null guard

#### 文件產出
- CHANGELOG.md — 修訂歷史
- PROGRESS.md (本檔) — 過程記錄
- TODO.md — 後續優化清單
- README.md — GitHub 部署指南
- PHOTO_REPLACEMENT_SOP.md — 實況照片替換 SOP

---

## 🏗️ 架構決策

### 為何放棄第三方框架?
- Phaser ~200KB / Pixi.js ~140KB / Three.js ~600KB
- 本專案只要 2D + 簡單動畫 + Canvas 警示,Vanilla JS 完全夠用
- 零依賴 = 載入快 + GitHub Pages 友善 + 國小老師可自行修改

### 為何用 SVG 而不是實況照片?
- 部署時還沒有實況照片(茄苳國小校門口/校車尚未拍攝)
- SVG 壓縮後 < 10KB/張,實況照片可能 100KB+ 一張
- SVG 可程式化著色,符合「小手牽大手」設計
- **保留套用實況照片的彈性**(見 PHOTO_REPLACEMENT_SOP.md)

### 為何用 Web Audio API 合成音效?
- 一個 MP3 音效檔 ~5-20KB,7 種音效 = 100KB+
- Web Audio OscillatorNode 純程式波形 = 0 bytes
- 音色簡單(叮咚/嗶嗶/喇叭)用合成反而更清脆
- 無版權問題

### 為何用 Web Speech API?
- 不需要裝任何 TTS 模型
- 瀏覽器原生支援中文(zh-TW)
- 一個 .mp3 配音檔要錄音 + 處理 + 上傳,TTS 改文案直接生效
- 缺點:首次播放會下載語音模型(~5MB),第二次以後 cache

---

## 📊 統計

| 項目 | 數量 |
|------|------|
| 總檔案數 | 39 個 |
| 總大小 | 444 KB |
| JS 檔 | 14 個 |
| CSS 檔 | 3 個 |
| SVG 圖檔 | 18 個 |
| HTML | 1 個 |
| MD 文件 | 5 個(本檔 + CHANGELOG + TODO + README + SOP) |
| 程式碼行數 | ~3000 行 (含 CSS/JS) |
| 場景數 | 9 個(Intro/Menu/Level1-5/Ending/Parent) |
| 開發時間 | ~8 小時 |

---

## 🔄 進度儀表板

| Phase | 狀態 | 完成日 |
|-------|------|--------|
| 規格書 | ✅ | 09-19 |
| 核心引擎 | ✅ | 09-19 |
| 9 場景 Scene | ✅ | 09-19 |
| SVG 資產 | ✅ | 09-19 |
| 音效合成 | ✅ | 09-19 |
| 語音 TTS | ✅ | 09-19 |
| 觸控/鍵盤輸入 | ✅ | 09-19 |
| PWA manifest | ✅ | 09-19 |
| Bug 修復 | ✅ | 09-19/20 |
| 完整流程測試 | ✅ | 09-20 |
| 過程記錄文件 | ✅ | 09-20 |
| Git init + commit | 🔄 | 進行中 |
| 實況照片拍攝 | ⏳ | 待大人安排 |
| 桃園市府審查 | ⏳ | 待定 |
| GitHub Pages 上線 | ⏳ | 待 Git push |

---

## 📌 給未來接手者

1. **所有 Scene 子類別必須實作 `render()` 方法**,不要在 onEnterAsync 內呼叫 render()(基類會統一處理)
2. **新增 Scene 時**,bindEvents 內的 selector 必須在 render() 寫入 DOM 之後才找得到
3. **Scene 緩存機制**:同一個 sceneName 只會 create 一次實例,onExit 會清空 element,onEnter 會重建。若要在切換時重置狀態(如 answered Set),要在 onEnterAsync 內重設
4. **音效統一在 AudioSystem 內**,用 `this.playSound('correct')` / `'error'` / `'busHorn'` 等預定義字串
5. **新增關卡**:複製 Level1Scene.js → 改 render / onOptionSelect / onCorrectChoice,加進 scenes Map,在 SPEC.md 補上設計