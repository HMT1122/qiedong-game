/**
 * Level4Scene - 第四關：行駛中
 * 教學重點：坐好不走動、輕聲細語、手腳不伸出窗外
 */

import { Scene } from './Scene.js';

export class Level4Scene extends Scene {
    constructor(game) {
        super(game);
        this.answered = new Set();
        this.correctCount = 0;
        this.levelCompleted = false;
    }
    
    getSceneTitle() {
        return '第四關：行駛中';
    }
    
    async onEnterAsync(data) {
        this.answered.clear();
        this.correctCount = 0;
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
                    <p style="text-align:center; color:var(--color-text-light); margin-bottom:var(--space-sm); font-weight:500; grid-column:1/-1;">請判斷以下行為在車上「可以」或「不可以」</p>
                    ${behaviors.map(b => `
                        <button class="level4-behavior" data-id="${b.id}" data-correct="${b.correct}" role="button" tabindex="0" aria-label="${b.text}${b.correct ? '：可以' : '：不可以'}">
                            <div class="level4-behavior-icon" aria-hidden="true">${b.icon}</div>
                            <span class="level4-behavior-text">${b.text}</span>
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
    
    async onBehaviorSelect(btn) {
        const id = btn.dataset.id;
        const isCorrect = btn.dataset.correct === 'true';
        
        if (this.answered.has(id) || this.levelCompleted) return;
        
        this.answered.add(id);
        this.playSound('click');
        
        if (isCorrect) {
            btn.classList.add('correct');
            this.correctCount++;
            this.playSound('correct');
            await this.showDialog('qiedong', this.getDialog(`level4.correct.${id}`), { typewriter: true });
        } else {
            btn.classList.add('wrong');
            this.playSound('error');
            this.$('#character').classList.add('sad');
            
            // 車子震動
            this.element.classList.add('level4-bus-shake');
            await this.delay(500);
            this.element.classList.remove('level4-bus-shake');
            this.$('#character').classList.remove('sad');
            
            await this.showDialog('qiedong', this.getDialog(`level4.wrong.${id}`), { typewriter: true });
        }
        
        this.hideDialog();
        
        // 檢查是否全部答對 (玩家已答完所有行為)
        // 正確行為有 1 個（安靜坐好），錯誤行為 3 個；全部答完才過關
        if (this.answered.size === 4) {
            this.levelCompleted = true;
            await this.delay(1000);
            this.playSound('levelComplete');
            await this.showDialog('qiedong', this.getDialog('level4.complete'), { typewriter: true });
            this.addStar(1);
            await this.delay(1500);
            this.hideDialog();
            await this.changeScene('level5', { fromLevel: 'level4' });
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