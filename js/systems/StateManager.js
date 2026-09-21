/**
 * StateManager - 遊戲狀態管理
 * 處理進度儲存、星星收集、關卡解鎖、LocalStorage 持久化
 */

const STORAGE_KEY = 'qiedong_game_state';
const CURRENT_VERSION = 1;

export class StateManager {
    constructor() {
        this.state = this.getDefaultState();
        this.load();
    }
    
    getDefaultState() {
        return {
            version: CURRENT_VERSION,
            stars: 0,
            maxStars: 6,
            completedLevels: [],
            currentLevel: null,
            unlockedLevels: ['level1'],
            settings: {
                audioEnabled: true,
                voiceEnabled: true,
                reducedMotion: false,
                highContrast: false
            },
            stats: {
                totalPlayTime: 0,
                levelAttempts: {},
                levelCompletions: {},
                lastPlayed: null
            },
            firstVisit: true
        };
    }
    
    // ========================================
    // 載入/儲存
    // ========================================
    load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // 版本遷移
                if (parsed.version !== CURRENT_VERSION) {
                    this.migrate(parsed);
                } else {
                    this.state = { ...this.getDefaultState(), ...parsed };
                }
            }
        } catch (error) {
            console.warn('載入遊戲狀態失敗，使用預設值:', error);
            this.state = this.getDefaultState();
        }
        
        // 偵測系統偏好
        this.detectSystemPreferences();
    }
    
    save() {
        try {
            this.state.lastPlayed = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (error) {
            console.error('儲存遊戲狀態失敗:', error);
        }
    }
    
    migrate(oldState) {
        // 未來版本遷移邏輯
        this.state = { ...this.getDefaultState(), ...oldState, version: CURRENT_VERSION };
        this.save();
    }
    
    detectSystemPreferences() {
        this.state.settings.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.state.settings.highContrast = window.matchMedia('(prefers-contrast: high)').matches;
        
        // 監聽變化
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.state.settings.reducedMotion = e.matches;
            this.save();
        });
        
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            this.state.settings.highContrast = e.matches;
            this.save();
        });
    }
    
    // ========================================
    // 星星管理
    // ========================================
    addStars(count) {
        this.state.stars = Math.min(this.state.maxStars, this.state.stars + count);
        this.save();
        return this.state.stars;
    }
    
    getStars() {
        return this.state.stars;
    }
    
    getMaxStars() {
        return this.state.maxStars;
    }
    
    // ========================================
    // 關卡管理
    // ========================================
    completeLevel(levelName, attempts = 1) {
        if (!this.state.completedLevels.includes(levelName)) {
            this.state.completedLevels.push(levelName);
        }
        
        // 解鎖下一關
        const levelOrder = ['level1', 'level2', 'level3', 'level4', 'level5'];
        const currentIndex = levelOrder.indexOf(levelName);
        if (currentIndex >= 0 && currentIndex < levelOrder.length - 1) {
            const nextLevel = levelOrder[currentIndex + 1];
            if (!this.state.unlockedLevels.includes(nextLevel)) {
                this.state.unlockedLevels.push(nextLevel);
            }
        }
        
        // 統計
        this.state.stats.levelCompletions[levelName] = (this.state.stats.levelCompletions[levelName] || 0) + 1;
        this.state.stats.levelAttempts[levelName] = (this.state.stats.levelAttempts[levelName] || 0) + attempts;
        this.state.currentLevel = levelName;
        this.state.lastPlayed = Date.now();
        
        this.save();
    }
    
    recordAttempt(levelName) {
        this.state.stats.levelAttempts[levelName] = (this.state.stats.levelAttempts[levelName] || 0) + 1;
        this.save();
    }
    
    isLevelUnlocked(levelName) {
        return this.state.unlockedLevels.includes(levelName);
    }
    
    isLevelCompleted(levelName) {
        return this.state.completedLevels.includes(levelName);
    }
    
    getCompletedLevels() {
        return [...this.state.completedLevels];
    }
    
    getUnlockedLevels() {
        return [...this.state.unlockedLevels];
    }
    
    getCurrentLevel() {
        return this.state.currentLevel;
    }
    
    // ========================================
    // 設定管理
    // ========================================
    getSettings() {
        return { ...this.state.settings };
    }
    
    updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.save();
    }
    
    isAudioEnabled() {
        return this.state.settings.audioEnabled;
    }
    
    isVoiceEnabled() {
        return this.state.settings.voiceEnabled;
    }
    
    // ========================================
    // 統計
    // ========================================
    getStats() {
        return { ...this.state.stats };
    }
    
    addPlayTime(ms) {
        this.state.stats.totalPlayTime += ms;
        this.save();
    }
    
    // ========================================
    // 重置
    // ========================================
    resetProgress() {
        const settings = this.state.settings;
        this.state = this.getDefaultState();
        this.state.settings = settings;
        this.save();
    }
    
    resetAll() {
        localStorage.removeItem(STORAGE_KEY);
        this.state = this.getDefaultState();
        this.detectSystemPreferences();
    }
    
    // ========================================
    // 首次造訪
    // ========================================
    isFirstVisit() {
        return this.state.firstVisit;
    }
    
    markVisited() {
        this.state.firstVisit = false;
        this.save();
    }
    
    // ========================================
    // 匯出/匯入 (備份用)
    // ========================================
    exportState() {
        return JSON.stringify(this.state, null, 2);
    }
    
    importState(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (imported.version) {
                this.state = { ...this.getDefaultState(), ...imported };
                this.save();
                return true;
            }
        } catch (error) {
            console.error('匯入狀態失敗:', error);
        }
        return false;
    }
}