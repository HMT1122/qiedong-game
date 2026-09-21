/**
 * MenuScene - 主選單場景
 */

import { Scene } from './Scene.js';

export class MenuScene extends Scene {
    constructor(game) {
        super(game);
    }
    
    getSceneTitle() {
        return '主選單';
    }
    
    async onEnterAsync(data) {
        this.updateStarDisplay();
        
        // 如果剛通關，播放慶祝音效
        if (data?.justCompleted) {
            this.playSound('levelComplete');
            await this.delay(500);
        }
    }
    
    render() {
        const stars = this.game.getStars();
        const maxStars = this.game.stateManager.getMaxStars();
        const completedLevels = this.game.stateManager.getCompletedLevels().length;
        
        this.element.innerHTML = `
            <div class="menu-scene" role="region" aria-label="主選單">
                <img class="menu-bg" src="assets/images/bg/menu-school.svg" alt="茄苳國小校園" loading="lazy">
                
                <div class="menu-content">
                    <div class="menu-character" aria-hidden="true">
                        ${this.getCharacterSVG('happy')}
                    </div>
                    
                    <h1 class="menu-title">茄冬寶寶上學安全日記</h1>
                    <p class="menu-subtitle">選擇關卡開始學習交通安全</p>
                    
                    <div class="menu-buttons">
                        <button class="menu-btn" data-level="level1" ${!this.game.stateManager.isLevelUnlocked('level1') ? 'disabled' : ''}>
                            <div class="menu-btn-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                            </div>
                            <span class="menu-btn-text">第一關：出門走路</span>
                            <span class="menu-btn-status">${this.getLevelStatus('level1')}</span>
                        </button>
                        
                        <button class="menu-btn" data-level="level2" ${!this.game.stateManager.isLevelUnlocked('level2') ? 'disabled' : ''}>
                            <div class="menu-btn-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            </div>
                            <span class="menu-btn-text">第二關：停等搭車</span>
                            <span class="menu-btn-status">${this.getLevelStatus('level2')}</span>
                        </button>
                        
                        <button class="menu-btn" data-level="level3" ${!this.game.stateManager.isLevelUnlocked('level3') ? 'disabled' : ''}>
                            <div class="menu-btn-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.58-5.99zM6.5 7h11l1.53 3.54L17.53 12H6.47L5 8.54 6.5 7zm12 5H6v5h12v-5z"/></svg>
                            </div>
                            <span class="menu-btn-text">第三關：準備上車 ⭐</span>
                            <span class="menu-btn-status">${this.getLevelStatus('level3')}</span>
                        </button>
                        
                        <button class="menu-btn" data-level="level4" ${!this.game.stateManager.isLevelUnlocked('level4') ? 'disabled' : ''}>
                            <div class="menu-btn-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            </div>
                            <span class="menu-btn-text">第四關：行駛中</span>
                            <span class="menu-btn-status">${this.getLevelStatus('level4')}</span>
                        </button>
                        
                        <button class="menu-btn" data-level="level5" ${!this.game.stateManager.isLevelUnlocked('level5') ? 'disabled' : ''}>
                            <div class="menu-btn-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                            </div>
                            <span class="menu-btn-text">第五關：下車</span>
                            <span class="menu-btn-status">${this.getLevelStatus('level5')}</span>
                        </button>
                    </div>
                    
                    <div class="menu-stars" aria-label="已收集星星">
                        ${[1,2,3,4,5,6].map(i => `
                            <svg class="menu-star ${i <= stars ? 'earned' : ''}" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
                                <path fill="#FFD700" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                        `).join('')}
                    </div>
                    
                    <p class="menu-footer">桃園市交通安全扎根教育 · 小手牽大手</p>
                </div>
            </div>
        `;
    }
    
    getCharacterSVG(mood = 'normal') {
        const eyeClass = mood === 'happy' ? 'eye-happy' : 'blink';
        const mouthPath = mood === 'happy' 
            ? 'M45 60 Q60 70 75 60' 
            : 'M50 55 Q60 65 70 55';
        
        return `
            <svg viewBox="0 0 120 120" class="qiedong-character" width="160" height="160">
                <circle cx="60" cy="55" r="35" fill="#2E7D32" opacity="0.2"/>
                <ellipse cx="60" cy="50" rx="28" ry="25" fill="#4CAF50" class="body-bounce"/>
                <ellipse cx="50" cy="42" rx="6" ry="7" fill="#1B5E20" class="eye-left ${eyeClass}"/>
                <ellipse cx="70" cy="42" rx="6" ry="7" fill="#1B5E20" class="eye-right ${eyeClass}"/>
                <path d="${mouthPath}" stroke="#1B5E20" stroke-width="3" fill="none" class="mouth-smile"/>
                <path d="M35 50 Q25 40 20 45" stroke="#2E7D32" stroke-width="4" fill="none" class="leaf-left wave"/>
                <path d="M85 50 Q95 40 100 45" stroke="#2E7D32" stroke-width="4" fill="none" class="leaf-right wave"/>
            </svg>
        `;
    }
    
    getLevelStatus(levelName) {
        if (this.game.stateManager.isLevelCompleted(levelName)) {
            return '<span style="color: var(--color-success);">✓ 完成</span>';
        }
        if (this.game.stateManager.isLevelUnlocked(levelName)) {
            return '<span style="color: var(--color-accent);">可遊玩</span>';
        }
        return '<span style="color: var(--color-text-light);">鎖定</span>';
    }
    
    updateStarDisplay() {
        const stars = this.game.getStars();
        this.$$('.menu-star').forEach((star, index) => {
            star.classList.toggle('earned', index < stars);
        });
    }
    
    bindEvents() {
        this.$$('.menu-btn').forEach(btn => {
            btn.addEventListener('click', () => this.onLevelSelect(btn.dataset.level));
        });
    }
    
    onLevelSelect(levelName) {
        if (!this.game.stateManager.isLevelUnlocked(levelName)) {
            this.playSound('error');
            this.showToast('請先完成前一關卡', 'warning');
            return;
        }
        
        this.playSound('click');
        this.changeScene(levelName);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}