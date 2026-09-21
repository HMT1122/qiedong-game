/**
 * 茄冬寶寶上學安全日記 - 遊戲主入口
 * 負責初始化所有系統、場景管理、遊戲循環
 */

import { GameEngine } from './systems/GameEngine.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { StateManager } from './systems/StateManager.js';
import { InputManager } from './systems/InputManager.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { TTS } from './utils/TTS.js';
import { IntroScene } from './scenes/IntroScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { Level1Scene } from './scenes/Level1Scene.js';
import { Level2Scene } from './scenes/Level2Scene.js';
import { Level3Scene } from './scenes/Level3Scene.js';
import { Level4Scene } from './scenes/Level4Scene.js';
import { Level5Scene } from './scenes/Level5Scene.js';
import { EndingScene } from './scenes/EndingScene.js';
import { ParentScene } from './scenes/ParentScene.js';
import { DialogSystem } from './utils/DialogSystem.js';
import { ModalSystem } from './utils/ModalSystem.js';
import { ToastSystem } from './utils/ToastSystem.js';
import { dialogs } from './data/dialogs.js';

// 全域遊戲實例
let game = null;

// 等待 DOM 就緒
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initGame();
    } catch (error) {
        console.error('遊戲初始化失敗:', error);
        console.error('Error stack:', error.stack);
        showErrorFallback(error);
    }
});

window.addEventListener('error', (e) => {
    console.error('[WINDOW ERROR]', e.message, 'at', e.filename + ':' + e.lineno + ':' + e.colno);
    if (e.error?.stack) console.error('Stack:', e.error.stack);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('[UNHANDLED REJECTION]', e.reason?.message || e.reason);
    if (e.reason?.stack) console.error('Stack:', e.reason.stack);
});

async function initGame() {
    // 1. 顯示載入畫面
    const loadingScreen = document.getElementById('loading-screen');
    const loadingFill = loadingScreen.querySelector('.loading-fill');
    const loadingPercent = loadingScreen.querySelector('.loading-percent');
    const loadingText = loadingScreen.querySelector('.loading-text');
    
    const updateLoading = (percent, text) => {
        loadingFill.style.width = `${percent}%`;
        loadingPercent.textContent = `${percent}%`;
        if (text) loadingText.textContent = text;
    };
    
    updateLoading(10, '初始化核心系統...');
    
    // 2. 初始化核心系統
    const audioSystem = new AudioSystem();
    await audioSystem.init();
    updateLoading(20, '載入音效系統...');
    
    const stateManager = new StateManager();
    updateLoading(30, '載入遊戲狀態...');
    
    const inputManager = new InputManager();
    updateLoading(40, '初始化輸入系統...');
    
    const assetLoader = new AssetLoader();
    updateLoading(50, '預載圖片資源...');
    
    const tts = new TTS();
    updateLoading(60, '初始化語音系統...');
    
    // 3. 載入對話資料
    updateLoading(70, '載入劇本資料...');
    
    // 4. 初始化 UI 系統
    const dialogSystem = new DialogSystem();
    const modalSystem = new ModalSystem();
    const toastSystem = new ToastSystem();
    updateLoading(80, '準備介面系統...');
    
    // 5. 建立場景映射
    const scenes = {
        intro: IntroScene,
        menu: MenuScene,
        level1: Level1Scene,
        level2: Level2Scene,
        level3: Level3Scene,
        level4: Level4Scene,
        level5: Level5Scene,
        ending: EndingScene,
        parent: ParentScene
    };
    
    updateLoading(90, '組裝遊戲場景...');
    
    // 7. 建立遊戲引擎
    game = new GameEngine({
        canvas: document.getElementById('game-canvas'),
        scenes,
        audioSystem,
        stateManager,
        inputManager,
        assetLoader,
        tts,
        dialogSystem,
        modalSystem,
        toastSystem,
        dialogs,
        initialScene: 'intro'
    });
    
    // 7. 綁定全域 UI
    bindGlobalUI(game, audioSystem);
    
    updateLoading(100, '準備就緒！');
    
    // 8. 隱藏載入畫面，啟動遊戲
    await delay(500);
    loadingScreen.classList.remove('active');
    document.getElementById('game-canvas').classList.add('active');
    await game.start();
    
    // 曝露給全域除錯用
    window.__GAME__ = game;
    console.log('🎮 茄冬寶寶上學安全日記 - 遊戲已啟動');
}

function bindGlobalUI(game, audioSystem) {
    // 音效開關
    const audioToggle = document.getElementById('audio-toggle');
    audioToggle.addEventListener('click', () => {
        const muted = audioSystem.toggleMute();
        audioToggle.classList.toggle('muted', muted);
        audioToggle.setAttribute('aria-pressed', !muted);
        game.toastSystem.show(muted ? '音效已關閉' : '音效已開啟', 'info');
    });
    
    // 暫停按鈕
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.addEventListener('click', () => {
        game.togglePause();
    });
    
    // 監聽遊戲狀態更新星星顯示
    game.on('starsChanged', (count) => {
        updateStarCounter(count);
    });
    
    game.on('sceneChanged', (sceneName) => {
        pauseBtn.style.display = ['intro', 'menu', 'ending', 'parent'].includes(sceneName) ? 'none' : 'flex';
    });
    
    // 初始星星顯示
    updateStarCounter(game.stateManager.getStars());
}

function updateStarCounter(count) {
    const starCount = document.querySelector('.star-count');
    const starTotal = document.querySelector('.star-total');
    const starIcon = document.querySelector('.star-icon');
    
    if (starCount) starCount.textContent = count;
    if (starTotal) starTotal.textContent = '/6';
    
    // 更新選單頁的星星 (如果存在)
    document.querySelectorAll('.menu-star').forEach((star, index) => {
        star.classList.toggle('earned', index < count);
    });
    
    // 星星獲得動畫
    if (starIcon) {
        starIcon.style.animation = 'none';
        starIcon.offsetHeight; // trigger reflow
        starIcon.style.animation = 'starPop 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showErrorFallback(error) {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.innerHTML = `
        <div class="loading-content">
            <h1 style="color: var(--color-danger);">遊戲載入失敗</h1>
            <p style="color: var(--color-text-light); margin: var(--space-md) 0;">請重新整理頁面再試一次</p>
            <pre style="background: var(--color-danger-bg); color: var(--color-danger); padding: var(--space-md); border-radius: var(--radius-md); max-width: 90%; overflow: auto; font-size: 12px;">${error.message}</pre>
            <button class="btn btn-primary" onclick="location.reload()">重新載入</button>
        </div>
    `;
}