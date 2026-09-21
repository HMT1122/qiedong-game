/**
 * Level4Scene - 第四關：行駛中
 * 教學重點：坐好不走動、輕聲細語、手腳不伸出窗外
 */

import { Scene } from './Scene.js';

export class Level4Scene extends Scene {
    constructor(game) {
        super(game);
        this.answered = new Set();
        this.levelCompleted = false;
    }
    
    getSceneTitle() {
        return '第四關：行駛中';
    }
    
    async onEnterAsync(data) {
        this.answered.clear();
        this.levelCompleted = false;
        await this.playIntroDialog();
    }
    
    render() {
        const behaviors = [
            { id: 'sit', icon: '🧘', text: '安靜坐好', correct: true },
            { id: 'walk', icon: '🚶', text: '站起來走路', correct: false },
            { id: 'shout', icon: '🗣️', text: '大聲尖叫', correct: false },
            { id: 'handout', icon: '🤚', text: '把手伸出窗外', correct: false }
        ];
        
        this.element.innerHTML = `
            <div class="level4-scene" role="region" aria-label="第四關：行駛中">
                <header class="level-header">
                    <h2 class="level-title">
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        第四關：行駛中
                    </h2>
                    <div class="level-progress" aria-label="關卡進度">
                        <div class="progress-dot completed" aria-label="第一關完成"></div>
                        <div class="progress-dot completed" aria-label="第二關完成"></div>
                        <div class="progress-dot completed" aria-label="第三關完成"></div>
                        <div class="progress-dot active" aria-label="第四關進行中"></div>
                        <div class="progress-dot" aria-label="第五關"></div>
                    </div>
                </header>
                
                <main class="level-scene">
                    <img class="scene-bg level4-bg" src="assets/images/bg/level4-bus-inside.svg" alt="校車車廂內部，有座位、窗戶" loading="eager">
                    
                    <div class="character" id="character" aria-hidden="true">
                        ${this.getCharacterSVG()}
                    </div>
                </main>
                
                <div class="options-area level4-behaviors" id="behaviors" role="group" aria-label="判斷車上行為可否">
                    <p style="text-align:center; color:var(--color-text-light); margin-bottom:var(--space-sm); font-weight:500; grid-column:1/-1;">點擊行為卡片，判斷在車上「可以」還是「不可以」</p>
                    ${behaviors.map(b => `
                        <button class="level4-behavior" data-id="${b.id}" data-correct="${b.correct}" role="button" tabindex="0" aria-label="${b.text}">
                            <div class="level4-behavior-icon" aria-hidden="true">${b.icon}</div>
                            <span class="level4-behavior-text">${b.text}</span>
                            <span class="level4-badge" style="display:none; font-size:12px; margin-top:4px; font-weight:bold;"></span>
                        </button>
                    `).join('')}
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
        this.$$('.level4-behavior').forEach(btn => {
            btn.addEventListener('click', () => this.onBehaviorSelect(btn));
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.onBehaviorSelect(btn);
                }
            });
        });
    }
    
    onBehaviorSelect(btn) {
        const id = btn.dataset.id;
        const shouldBeAllowed = btn.dataset.correct === 'true';
        const behaviorText = btn.querySelector('.level4-behavior-text').textContent;
        const icon = btn.querySelector('.level4-behavior-icon').textContent;
        
        if (this.answered.has(id) || this.levelCompleted) return;
        this.playSound('click');
        
        this.showModal({
            title: '行為判斷',
            icon: 'info',
            body: `
                <div style="text-align:center; padding: 10px 0;">
                    <div style="font-size: 40px; margin-bottom: 8px;">${icon}</div>
                    <p style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">「${behaviorText}」</p>
                    <p style="color: var(--color-text-light);">在行駛中的校車上，可以這樣做嗎？</p>
                </div>
            `,
            buttons: [
                {
                    text: '🙆 可以',
                    class: 'btn-primary',
                    fullWidth: true,
                    onClick: () => this.handleUserAnswer(btn, id, true, shouldBeAllowed)
                },
                {
                    text: '🙅 不可以',
                    class: 'btn-secondary',
                    fullWidth: true,
                    onClick: () => this.handleUserAnswer(btn, id, false, shouldBeAllowed)
                }
            ],
            closeOnOverlayClick: true
        });
    }
    
    async handleUserAnswer(btn, id, userChoice, shouldBeAllowed) {
        const isCorrect = (userChoice === shouldBeAllowed);
        
        if (isCorrect) {
            this.answered.add(id);
            btn.classList.add('correct');
            btn.disabled = true;
            
            const badge = btn.querySelector('.level4-badge');
            if (badge) {
                badge.style.display = 'block';
                badge.style.color = shouldBeAllowed ? 'var(--color-success)' : '#D32F2F';
                badge.textContent = shouldBeAllowed ? '✓ 可以 (安全)' : '✓ 不可以 (危險)';
            }
            
            this.playSound('correct');
            await this.showDialog('qiedong', this.getDialog(`level4.correct.${id}`), { typewriter: true });
            
            await this.delay(1200);
            this.hideDialog();
            
            // 4 個題目都答對即過關
            if (this.answered.size === 4) {
                this.levelCompleted = true;
                if (!this.game.stateManager.isLevelCompleted('level4')) {
                    this.addStar(1);
                }
                this.game.stateManager.completeLevel('level4');
                
                await this.delay(500);
                this.playSound('levelComplete');
                await this.showDialog('qiedong', this.getDialog('level4.complete'), { typewriter: true });
                await this.delay(1500);
                this.hideDialog();
                await this.changeScene('level5', { fromLevel: 'level4' });
            }
        } else {
            this.playSound('error');
            this.$('#character').classList.add('sad');
            this.element.classList.add('level4-bus-shake');
            
            setTimeout(() => this.element.classList.remove('level4-bus-shake'), 500);
            setTimeout(() => this.$('#character').classList.remove('sad'), 1200);
            
            await this.showDialog('qiedong', this.getDialog(`level4.wrong.${id}`), { typewriter: true });
            await this.delay(2000);
            this.hideDialog();
        }
    }
    
    async playIntroDialog() {
        await this.showDialog('qiedong', this.getDialog('level4.intro'), { typewriter: true });
        await this.delay(2000);
        this.hideDialog();
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}