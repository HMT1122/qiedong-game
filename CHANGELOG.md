# CHANGELOG — 茄冬寶寶上學安全日記

> **修訂歷史 (Revision History)**
> 每一筆變更記錄請用 `## [版本] - YYYY-MM-DD` 開頭，包含 Added / Changed / Fixed / Removed 四段。

---

## [Unreleased] — 2026-09-19/20

### Fixed（重大 Bug 修復）
- **GameEngine.changeScene appendChild(null) TypeError**：原本流程是先 `appendChild(sceneInstance.element)` 再 `await sceneInstance.onEnter()`，但 Scene 基類 onEnter 才 createElement。修正：appendChild 前先檢查 `if (!sceneInstance.element) sceneInstance.createElement()`。
- **Scene.onEnter 生命週期順序錯誤**：原本 `createElement → bindEvents → onEnterAsync`，但子類別的 render() 寫在 onEnterAsync 內，導致 bindEvents 時 element 是空 div，所有 click listener 沒綁到任何東西。修正：`render → bindEvents → onEnterAsync`。
- **Level4Scene.correctCount 判斷錯誤**：原 `if (correctCount === 3)`，但實際只有 1 個正確選項（安靜坐好）。修正為 `if (answered.size === 4)`。
- **Level5Scene.checkDropZone 危險區覆蓋安全區**：當玩家把角色拖曳到安全區和危險區重疊位置時，危險區後被匹配，覆蓋了正確判斷。修正：safe zone 優先保留，不可被 danger 覆蓋。
- **CSS .drag-target 缺少 position: absolute**：導致 JS 設定的 `style.left/top` 無效，拖曳功能完全失效。
- **manifest.json 圖片資源 404**：原本引用 .png 圖檔但專案只有 .svg。修正為 .svg + image/svg+xml。
- **Scene.getDialog null guard**：當 sceneInstance.game 是 null 時（如 cache hit 還沒建立 game 引用）會 throw。加上 `if (!this.game) return key` 防護。

### Changed
- **重構 Scene 子類別**：移除所有 onEnterAsync 內重複的 `this.render()` 呼叫，改由 Scene 基類統一管理。
- **main.js 啟動流程**：canvas 加 `.active` class 切換顯示。
- **IntroScene**：重寫成獨立的 typewriteText + waitOrSkip 邏輯，繞過 DialogSystem 的 async 問題。

### Added
- 全 5 關 + 結局 + 親子共學 共 9 個場景 Scene 全部寫完
- 9 個 SVG 場景背景與物件（全部壓縮）
- 8 種尺寸 PWA 圖標 (72/96/128/144/152/192/384/512)
- 鍵盤操作支援（按 Enter 或方向鍵）
- LocalStorage 進度存檔
- 拖曳互動（滑鼠 + 觸控 + 鍵盤）
- Canvas 動態繪製死角與內輪差

---

## [0.1.0] — 2026-09-19 — Initial

### Added
- 專案結構建立：index.html + css/ + js/ + assets/
- SPEC.md 專案規格書
- 26 個檔案全部寫完（HTML/CSS/JS/SVG）
- Web Audio API 零音檔依賴的音效合成
- Web Speech API 中文語音
- Touch + Keyboard + Mouse 全平台輸入支援
- 完整測試伺服器（Python http.server:8765）

---

## 格式範本

新增條目時請用以下格式：

```markdown
## [版本號] — YYYY-MM-DD

### Added
- 新增的功能

### Changed
- 修改的行為

### Fixed
- 修復的 Bug

### Removed
- 移除的程式碼或資源
```

版本號規則：
- 主版號.次版號.修訂號 (e.g. 1.0.0)
- 重大架構變更 → 主版號+1
- 新增功能 → 次版號+1
- Bug 修復 → 修訂號+1