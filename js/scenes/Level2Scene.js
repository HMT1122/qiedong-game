/**
 * Level2Scene - 第二關：停等搭車
 * 教學重點：站在安全候車區、不要站在馬路邊
 */

import { Scene } from './Scene.js';

export class Level2Scene extends Scene {
    constructor(game) {
        super(game);
        this.selectedOption = null;
        this.levelCompleted = false;
    }
    
    getSceneTitle() {
        return '第二關：停等搭車';
    }
    
    async onEnterAsync(data) {
        this.selectedOption = null;
        this.levelCompleted = false;
        await this.playIntroDialog();
    }
    
    render() {
        this.element.innerHTML = `
            <div class="level2-scene" role="region" aria-label="第二關：停等搭車">
                <header class="level-header">
                    <h2 class="level-title">
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        第二關：停等搭車
                    </h2>
                    <div class="level-progress" aria-label="關卡進度">
                        <div class="progress-dot completed" aria-label="第一關完成"></div>
                        <div class="progress-dot active" aria-label="第二關進行中"></div>
                        <div class="progress-dot" aria-label="第三關"></div>
                        <div class="progress-dot" aria-label="第四關"></div>
                        <div class="progress-dot" aria-label="第五關"></div>
                    </div>
                </header>
                
                <main class="level-scene">
                    <img class="scene-bg level2-bg" src="assets/images/bg/level2-bus-stop.svg" alt="校車站牌，有安全候車區、馬路邊危險區" loading="eager">
                    
                    <div class="character" id="character" aria-hidden="true">
                        ${this.getCharacterSVG()}
                    </div>
                </main>
                
                <div class="options-area" id="options-area" role="group" aria-label="選擇候車位置">
                    <p style="text-align:center; color:var(--color-text-light); margin-bottom:var(--space-sm); font-weight:500;">請點選安全的候車位置</p>
                    
                    <div class="level2-stops">
                        <!-- 正確：安全候車區 -->
                        <div class="level2-stop" data-choice="correct" role="button" tabindex="0" aria-label="安全候車區：離馬路有距離，有站牌標示">
                            <img class="level2-stop-img" src="assets/images/objects/bus-stop-safe.svg" alt="安全候車區：離馬路有距離，有綠色標線" loading="lazy">
                            <div class="level2-stop-label">安全候車區</div>
                            <div class="level2-stop-marker correct" aria-hidden="true">✓</div>
                            <div class="level2-stop-marker danger" aria-hidden="true">✗</div>
                        </div>
                        
                        <!-- 危險1：馬路邊 -->
                        <div class="level2-stop" data-choice="danger1" role="button" tabindex="0" aria-label="馬路邊：太靠近車道，很危險">
                            <img class="level2-stop-img" src="assets/images/objects/bus-stop-danger1.svg" alt="馬路邊危險區：緊鄰車道，無保護" loading="lazy">
                            <div class="level2-stop-label">馬路邊</div>
                            <div class="level2-stop-marker correct" aria-hidden="true">✓</div>
                            <div class="level2-stop-marker danger" aria-hidden="true">✗</div>
                        </div>
                        
                        <!-- 危險2：車道上 -->
                        <div class="level2-stop" data-choice="danger2" role="button" tabindex="0" aria-label="車道上：直接站在行車道，極度危險">
                            <img class="level2-stop-img" src="assets/images/objects/bus-stop-danger2.svg" alt="車道上危險區：站在行車道中央" loading="lazy">
                            <div class="level2-stop-label">車道上</div>
                            <div class="level2-stop-marker correct" aria-hidden="true">✓</div>
                            <div class="level2-stop-marker danger" aria-hidden="true">✗</div>
                        </div>
                    </div>
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
        this.$$('.level2-stop').forEach(stop => {
            stop.addEventListener('click', () => this.onStopSelect(stop.dataset.choice));
            stop.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.onStopSelect(stop.dataset.choice);
                }
            });
        });
    }
    
    async onStopSelect(choice) {
        if (this.levelCompleted) return;
        
        const stop = this.$(`[data-choice="${choice}"]`);
        this.playSound('click');
        
        if (choice === 'correct') {
            await this.onCorrectChoice(stop);
        } else {
            await this.onDangerChoice(stop, choice);
        }
    }
    
    async onCorrectChoice(stop) {
        stop.classList.add('correct');
        this.$$('#options-area .level2-stop').forEach(s => s.style.pointerEvents = 'none');
        
        this.$('#character').classList.add('happy');
        
        this.playSound('correct');
        await this.showDialog('qiedong', this.getDialog('level2.correct'), { typewriter: true });
        
        this.addStar(1);
        this.levelCompleted = true;
        
        await this.delay(1500);
        this.hideDialog();
        await this.changeScene('level3', { fromLevel: 'level2' });
    }
    
    async onDangerChoice(stop, choice) {
        stop.classList.add('danger');
        
        this.$('#character').classList.add('sad');
        
        // 畫面震動
        this.element.classList.add('animate-shake');
        this.playSound('danger');
        await this.delay(500);
        this.element.classList.remove('animate-shake');
        
        const dangerMessages = {
            danger1: this.getDialog('level2.danger1'),
            danger2: this.getDialog('level2.danger2')
        };
        
        await this.showModal({
            title: '危險！',
            icon: 'danger',
            body: dangerMessages[choice] || this.getDialog('level2.danger'),
            buttons: [
                { text: '重新選擇', class: 'btn-primary', fullWidth: true, onClick: () => this.resetChoices() }
            ],
            closeOnOverlayClick: false,
            closeOnEscape: false
        });
    }
    
    resetChoices() {
        this.$$('#options-area .level2-stop').forEach(stop => {
            stop.classList.remove('correct', 'danger');
            stop.style.pointerEvents = 'auto';
        });
        this.$('#character').classList.remove('happy', 'sad');
        this.selectedOption = null;
    }
    
    async playIntroDialog() {
        await this.showDialog('qiedong', this.getDialog('level2.intro'), { typewriter: true });
        await this.delay(2000);
        this.hideDialog();
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}