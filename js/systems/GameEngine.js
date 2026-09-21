/**
 * GameEngine - 遊戲核心引擎
 * 負責場景管理、遊戲循環、事件總線
 */

export class GameEngine {
    constructor(config) {
        this.canvas = config.canvas;
        this.scenes = config.scenes;
        this.audioSystem = config.audioSystem;
        this.stateManager = config.stateManager;
        this.inputManager = config.inputManager;
        this.assetLoader = config.assetLoader;
        this.tts = config.tts;
        this.dialogSystem = config.dialogSystem;
        this.modalSystem = config.modalSystem;
        this.toastSystem = config.toastSystem;
        this.dialogs = config.dialogs;
        this.initialScene = config.initialScene || 'intro';
        
        // 遊戲狀態
        this.currentScene = null;
        this.currentSceneName = null;
        this.isRunning = false;
        this.isPaused = false;
        this.lastTimestamp = 0;
        
        // 事件系統
        this.events = new Map();
        
        // 場景實例快取
        this.sceneInstances = new Map();
        
        // 綁定輸入事件
        this.bindInputEvents();
    }
    
    // ========================================
    // 事件系統
    // ========================================
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(callback);
        return () => this.off(event, callback);
    }
    
    off(event, callback) {
        if (this.events.has(event)) {
            this.events.get(event).delete(callback);
        }
    }
    
    emit(event, ...args) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Event handler error for ${event}:`, error);
                }
            });
        }
    }
    
    // ========================================
    // 初始化與啟動
    // ========================================
    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        // 載入初始場景
        await this.changeScene(this.initialScene);
        
        // 啟動遊戲循環
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    // ========================================
    // 遊戲循環
    // ========================================
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        
        if (!this.isPaused && this.currentScene) {
            this.currentScene.update(deltaTime);
        }
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    // ========================================
    // 場景管理
    // ========================================
    async changeScene(sceneName, sceneData = {}) {
        // 卸載當前場景
        if (this.currentScene) {
            await this.currentScene.onExit();
            this.currentScene.destroy();
            this.currentScene = null;
        }
        
        // 取得或建立場景實例 (每次進入建立全新乾淨實例，確保事件與狀態不殘留)
        const SceneClass = this.scenes[sceneName];
        
        if (!SceneClass) {
            throw new Error(`場景不存在: ${sceneName}`);
        }
        
        const sceneInstance = new SceneClass(this);
        
        // 進入新場景
        this.currentSceneName = sceneName;
        this.currentScene = sceneInstance;
        
        // 渲染場景到 canvas
        this.canvas.innerHTML = '';
        // 先確保 element 已建立 (onEnter 內才建立會來不及 append)
        if (!sceneInstance.element) {
            sceneInstance.createElement();
        }
        this.canvas.appendChild(sceneInstance.element);
        
        await sceneInstance.onEnter(sceneData);
        
        // 觸發場景切換事件
        this.emit('sceneChanged', sceneName, sceneInstance);
        
        // 更新暫停按鈕顯示
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.style.display = ['intro', 'menu', 'ending', 'parent'].includes(sceneName) ? 'none' : 'flex';
        }
    }
    
    getCurrentScene() {
        return this.currentScene;
    }
    
    getCurrentSceneName() {
        return this.currentSceneName;
    }
    
    // ========================================
    // 暫停/恢復
    // ========================================
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.showPauseMenu();
        } else {
            this.hidePauseMenu();
        }
        
        if (this.currentScene) {
            this.currentScene.onPauseChange(this.isPaused);
        }
    }
    
    showPauseMenu() {
        this.modalSystem.show({
            title: '遊戲暫停',
            icon: 'pause',
            body: '<p style="text-align:center;">點擊繼續遊戲</p>',
            buttons: [
                { text: '繼續遊戲', class: 'btn-primary', onClick: () => this.togglePause() },
                { text: '回主選單', class: 'btn-secondary', onClick: () => this.goToMenu() }
            ],
            closeOnOverlayClick: false
        });
    }
    
    hidePauseMenu() {
        this.modalSystem.hide();
    }
    
    async goToMenu() {
        this.hidePauseMenu();
        this.isPaused = false;
        await this.changeScene('menu');
    }
    
    // ========================================
    // 遊戲流程控制
    // ========================================
    async nextLevel() {
        const levelOrder = ['level1', 'level2', 'level3', 'level4', 'level5'];
        const currentIndex = levelOrder.indexOf(this.currentSceneName);
        
        if (currentIndex >= 0 && currentIndex < levelOrder.length - 1) {
            await this.changeScene(levelOrder[currentIndex + 1]);
        } else if (currentIndex === levelOrder.length - 1) {
            // 全部通關
            await this.changeScene('ending');
        }
    }
    
    async retryLevel() {
        await this.changeScene(this.currentSceneName);
    }
    
    // ========================================
    // 星星管理
    // ========================================
    addStar(count = 1) {
        const newTotal = this.stateManager.addStars(count);
        this.emit('starsChanged', newTotal);
        return newTotal;
    }
    
    getStars() {
        return this.stateManager.getStars();
    }
    
    // ========================================
    // 輸入事件綁定
    // ========================================
    bindInputEvents() {
        // 鍵盤事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.modalSystem.isVisible()) {
                    this.modalSystem.hide();
                } else if (this.currentSceneName && !['intro', 'menu'].includes(this.currentSceneName)) {
                    this.togglePause();
                }
            }
            
            // 快捷鍵：M 靜音
            if (e.key.toLowerCase() === 'm') {
                const audioToggle = document.getElementById('audio-toggle');
                if (audioToggle) audioToggle.click();
            }
        });
        
        // 觸控防止頁面縮放
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }
    
    // ========================================
    // 工具方法
    // ========================================
    playSound(soundName) {
        this.audioSystem.play(soundName);
    }
    
    speak(text, options = {}) {
        return this.tts.speak(text, options);
    }
    
    showDialog(character, text, options = {}) {
        if (this.tts && this.stateManager?.isVoiceEnabled()) {
            this.tts.speak(text).catch(() => {});
        }
        return this.dialogSystem.show(character, text, options);
    }
    
    hideDialog() {
        if (this.tts) {
            this.tts.stop();
        }
        this.dialogSystem.hide();
    }
    
    showModal(options) {
        return this.modalSystem.show(options);
    }
    
    hideModal() {
        this.modalSystem.hide();
    }
    
    showToast(message, type = 'info') {
        this.toastSystem.show(message, type);
    }
    
    getDialog(key) {
        return this.dialogs[key] || key;
    }
    
    // ========================================
    // 銷毀
    // ========================================
    destroy() {
        this.isRunning = false;
        
        if (this.currentScene) {
            this.currentScene.destroy();
        }
        
        this.sceneInstances.forEach(instance => instance.destroy());
        this.sceneInstances.clear();
        
        this.events.clear();
        
        this.audioSystem.destroy();
        this.inputManager.destroy();
    }
}