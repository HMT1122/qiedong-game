/**
 * Level1Scene - 第一關：出門走路
 * 教學重點：走在人行道、過馬路停看聽走
 */

import { Scene } from './Scene.js';

export class Level1Scene extends Scene {
    constructor(game) {
        super(game);
        this.selectedOption = null;
        this.levelCompleted = false;
    }
    
    getSceneTitle() {
        return '第一關：出門走路';
    }
    
    async onEnterAsync(data) {
        this.selectedOption = null;
        this.levelCompleted = false;
        await this.playIntroDialog();
    }
    
    render() {
        this.element.innerHTML = `
            <div class="level1-scene" role="region" aria-label="第一關：出門走路">
                <header class="level-header">
                    <h2 class="level-title">
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        第一關：出門走路
                    </h2>
                    <div class="level-progress" aria-label="關卡進度">
                        <div class="progress-dot completed" aria-label="開場完成"></div>
                        <div class="progress-dot active" aria-label="第一關進行中"></div>
                        <div class="progress-dot" aria-label="第二關"></div>
                        <div class="progress-dot" aria-label="第三關"></div>
                        <div class="progress-dot" aria-label="第四關"></div>
                        <div class="progress-dot" aria-label="第五關"></div>
                    </div>
                </header>
                
                <main class="level-scene">
                    <!-- 場景背景 -->
                    <div class="level1-road">
                        <img class="level1-road-bg scene-bg" src="assets/images/bg/level1-road.svg" alt="茄苳國小附近道路，有人行道、斑馬線、馬路" loading="eager">
                        
                        <!-- 角色 -->
                        <div class="character" id="character" aria-hidden="true">
                            ${this.getCharacterSVG()}
                        </div>
                        
                        <!-- 車子 (危險選項時出現) -->
                        <img class="level1-car" id="danger-car" src="assets/images/objects/car.svg" alt="行駛中的汽車" aria-hidden="true">
                        
                        <!-- 斑馬線 -->
                        <div class="level1-crosswalk" id="crosswalk" aria-hidden="true"></div>
                    </div>
                </main>
                
                <!-- 選項區域 -->
                <div class="options-area" id="options-area" role="group" aria-label="選擇走路方式">
                    <button class="option-btn" data-choice="correct" role="button" tabindex="0">
                        <svg class="option-icon" viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path fill="#4CAF50" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        <span class="option-text">走在人行道，過馬路時停看聽走</span>
                    </button>
                    <button class="option-btn" data-choice="danger" role="button" tabindex="0">
                        <svg class="option-icon" viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path fill="#D32F2F" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        <span class="option-text">走在馬路中間邊玩邊衝</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    getCharacterSVG() {
        return `
            <svg viewBox="0 0 100 100" width="100" height="100">
                <circle cx="50" cy="50" r="30" fill="#4CAF50"/>
                <ellipse cx="42" cy="42" rx="5" ry="6" fill="#1B5E20"/>
                <ellipse cx="58" cy="42" rx="5" ry="6" fill="#1B5E20"/>
                <path d="M40 58 Q50 68 60 58" stroke="#1B5E20" stroke-width="2.5" fill="none"/>
                <path d="M30 48 Q20 38 15 42" stroke="#2E7D32" stroke-width="3.5" fill="none"/>
                <path d="M70 48 Q80 38 85 42" stroke="#2E7D32" stroke-width="3.5" fill="none"/>
            </svg>
        `;
    }
    
    bindEvents() {
        const btns = this.$$('#options-area .option-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.onOptionSelect(btn.dataset.choice);
            });
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.onOptionSelect(btn.dataset.choice);
                }
            });
        });
    }
    
    async onOptionSelect(choice) {
        if (this.levelCompleted) return;
        
        const btn = this.$(`[data-choice="${choice}"]`);
        this.playSound('click');
        
        if (choice === 'correct') {
            await this.onCorrectChoice(btn);
        } else {
            await this.onDangerChoice(btn);
        }
    }
    
    async onCorrectChoice(btn) {
        btn.classList.add('correct');
        btn.disabled = true;
        
        // 角色開心動畫
        this.$('#character').classList.add('happy');
        
        this.playSound('correct');
        await this.showDialog('qiedong', this.getDialog('level1.correct'), { typewriter: true });
        
        if (!this.game.stateManager.isLevelCompleted('level1')) {
            this.addStar(1);
        }
        this.game.stateManager.completeLevel('level1');
        this.levelCompleted = true;
        
        await this.delay(1500);
        this.hideDialog();
        await this.changeScene('level2', { fromLevel: 'level1' });
    }
    
    async onDangerChoice(btn) {
        btn.classList.add('danger');
        btn.disabled = true;
        
        // 播放危險動畫：車子出現
        const car = this.$('#danger-car');
        const crosswalk = this.$('#crosswalk');
        const character = this.$('#character');
        
        character.classList.add('sad');
        car.classList.add('appear');
        crosswalk.style.opacity = '1';
        
        this.playSound('danger');
        
        // 震動效果
        this.element.classList.add('animate-shake');
        await this.delay(500);
        this.element.classList.remove('animate-shake');
        
        // 顯示安全小叮嚀
        await this.showModal({
            title: '危險！',
            icon: 'danger',
            body: this.getDialog('level1.danger'),
            buttons: [
                { text: '重新選擇', class: 'btn-primary', fullWidth: true, onClick: () => this.resetChoices() }
            ],
            closeOnOverlayClick: false,
            closeOnEscape: false
        });
    }
    
    resetChoices() {
        this.$$('#options-area .option-btn').forEach(btn => {
            btn.classList.remove('correct', 'danger');
            btn.disabled = false;
        });
        this.$('#character').classList.remove('happy', 'sad');
        this.$('#danger-car').classList.remove('appear');
        this.$('#crosswalk').style.opacity = '0';
        this.selectedOption = null;
    }
    
    async playIntroDialog() {
        await this.showDialog('qiedong', this.getDialog('level1.intro'), { typewriter: true });
        await this.delay(2000);
        this.hideDialog();
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}