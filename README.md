# 茄冬寶寶上學安全日記 🚸

> **桃園市茄苳國小交通安全 HTML5 互動遊戲**
> 為國小學童與家長設計的零依賴、超輕量 (< 500KB) 網頁遊戲。
> 學會「停、看、聽、走」+ 校車死角 + 大型車內輪差,把交通安全知識帶回家。

---

## 🌟 特色

- ✅ **零外部依賴** — 純 Vanilla JS + CSS + Web Audio API,不用任何框架
- ✅ **超輕量** — 整包 444 KB(包含 9 個場景 SVG + 18 個圖示 + 完整程式碼)
- ✅ **完整觸控支援** — Tap / Drag & Drop / Keyboard,手機平板筆電都能玩
- ✅ **PWA** — 可加到主畫面,離線可用(待 Service Worker)
- ✅ **中文語音** — 用 Web Speech API 真人語音引導
- ✅ **進度存檔** — LocalStorage 記錄過關狀態
- ✅ **小手牽大手** — 結局強調家長共學

---

## 🎮 遊戲內容

5 個關卡 + 開場 + 結局 + 親子共學:

1. **第一關：出門走路** — 走人行道 vs 馬路中間,學「停、看、聽、走」
2. **第二關：停等搭車** — 選安全候車區,離馬路有距離
3. **第三關：準備上車 ⭐⭐** — 等車停穩 + 校車死角 + 大型車內輪差
4. **第四關：行駛中** — 安靜坐好、不站起來、不尖叫、不伸手出窗外
5. **第五關：下車** — 等車停 + 排隊 + 拖曳角色到安全區

**目標**:蒐集所有安全星星,成為「交通小達人」,把知識帶回家給爸媽!

---

## 🚀 快速開始

### 方法 1:直接開啟(本地測試用)
```bash
# 任何 HTTP server 都行(Python 3 內建)
python3 -m http.server 8765

# 或 Node.js
npx serve -p 8765

# 或 PHP
php -S localhost:8765
```
開啟瀏覽器 http://localhost:8765/

### 方法 2:GitHub Pages(給學生公開用)
1. 把這個 repo push 到 GitHub
2. 到 repo Settings → Pages → 選擇 `main` branch
3. 等待 1-2 分鐘,GitHub 會給你一個 `https://<username>.github.io/qiedong-game/` 網址
4. 把網址分享給茄苳國小老師與家長!

---

## 📁 專案結構

```
qiedong-game/
├── index.html              # 入口 HTML
├── manifest.json           # PWA 設定
├── SPEC.md                 # 完整技術規格書
├── README.md               # 本檔(部署說明)
├── CHANGELOG.md            # 修訂歷史
├── PROGRESS.md             # 開發過程記錄
├── TODO.md                 # 後續優化清單
├── PHOTO_REPLACEMENT_SOP.md # 實況照片替換 SOP
│
├── css/
│   ├── main.css            # 全域樣式 + 變數
│   ├── scenes.css          # 各關卡專屬樣式
│   └── animations.css      # 30+ CSS 動畫
│
├── js/
│   ├── main.js             # 入口 + 啟動流程
│   ├── data/
│   │   └── dialogs.js      # 中文字幕/語音台詞
│   ├── systems/
│   │   ├── GameEngine.js   # 場景切換引擎
│   │   ├── AudioSystem.js  # Web Audio 合成音效
│   │   ├── StateManager.js # 進度存檔
│   │   └── InputManager.js # Touch/Keyboard/Mouse
│   ├── utils/
│   │   ├── AssetLoader.js
│   │   ├── TTS.js          # Web Speech API
│   │   ├── DialogSystem.js # 對話框
│   │   ├── ModalSystem.js  # 警示彈窗
│   │   └── ToastSystem.js  # 簡訊提示
│   └── scenes/
│       ├── Scene.js        # 基類
│       ├── IntroScene.js   # 開場動畫
│       ├── MenuScene.js    # 主選單(5 關卡)
│       ├── Level1Scene.js  ~ Level5Scene.js
│       ├── EndingScene.js  # 結局總複習
│       └── ParentScene.js  # 親子共學
│
└── assets/images/
    ├── bg/                 # 場景背景 (9 個 SVG)
    ├── objects/            # 場景物件 (校車/站牌/車)
    ├── icon-*.svg          # PWA 圖示 (8 種尺寸)
    └── favicon.svg
```

---

## 🎨 客製化

### 1. 換學校 Logo 或吉祥物
編輯 `js/scenes/Scene.js` 內的 `getCharacterSVG()` 方法,把你的角色 SVG 貼進去。

### 2. 修改對話台詞
編輯 `js/data/dialogs.js`,所有中文文字集中管理。例如:
```javascript
'level1.intro': '第一關:出門走路!走在哪裡最安全呢?',
```

### 3. 換背景音樂 / 音效
編輯 `js/systems/AudioSystem.js`,Web Audio API 波形參數調整:
```javascript
'sounds.correct': () => {
    const osc = audioCtx.createOscillator();
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.1);
    // ...
}
```

### 4. 替換為實況照片
**重要**:請見 [PHOTO_REPLACEMENT_SOP.md](./PHOTO_REPLACEMENT_SOP.md)

---

## 🌐 瀏覽器支援

| 瀏覽器 | 版本 | 支援 |
|--------|------|------|
| Chrome / Edge | 90+ | ✅ 完整 |
| Safari iOS | 14+ | ✅ 完整(包含觸控) |
| Safari macOS | 14+ | ✅ 完整 |
| Firefox | 88+ | ✅ 完整 |
| Samsung Internet | 14+ | ✅ 完整 |
| IE 11 | - | ❌ 不支援(無 Web Audio API) |

---

## 📜 授權

本專案採用 **MIT 授權**,免費用於教育用途。

```
MIT License

Copyright (c) 2026 桃園市茄苳國小

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

完整授權條款見 LICENSE 檔。

---

## 🙏 致謝

- 桃園市政府教育局「交通安全扎根教育」政策
- 茄苳國小師生提供校門口與校車參考照片(待補)
- Web Audio API 教學:MDN Web Docs
- Web Speech API:Google Chrome / Apple Safari 內建 TTS

---

## 📞 聯絡

- **學校**:桃園市茄苳國小
- **專案維護**:請見 GitHub repo Issues
- **教育合作**:桃園市政府教育局 學輔校安科

---

## 🎯 給國小老師

**怎麼在課堂上用?**

1. 老師投影到教室螢幕(或學生用自己的平板)
2. 全班一起玩第一關,討論哪個選項安全
3. 每個學生輪流挑戰第三關(死角 + 內輪差是核心)
4. 通關後讓學生把「8 大重點」抄到聯絡簿,帶回家給家長看
5. 家庭任務:與家長一起完成「小手牽大手」重點複習

**怎麼知道學生有沒有學會?**

- 過關 = 選對所有正確選項
- 星星數 = 蒐集到的安全星星(滿分 8 顆)
- 第三關是核心,要特別要求學生過

**遇到 Bug?**

請回報到 GitHub Issues,附上:
1. 瀏覽器版本
2. 裝置(iPad / Android / 桌機)
3. 發生在哪一關
4. 截圖或錯誤訊息