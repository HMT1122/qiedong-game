/**
 * Level3Scene - 第三關：準備上車 (核心關卡)
 * 教學重點：等車停穩、校車死角、大型車內輪差
 * 這是最重要的關卡，包含 Canvas 動畫演示死角與內輪差
 */

import { Scene } from './Scene.js';

export class Level3Scene extends Scene {
    constructor(game) {
        super(game);
        this.phase = 'intro'; // intro, dangerDemo, waitBus, chooseEntry
        this.levelCompleted = false;
        this.starsEarned = 0;
        this.canvasAnimationId = null;
    }
    
    getSceneTitle() {
        return '第三關：準備上車 (核心關卡)';
    }
    
    async onEnterAsync(data) {
        this.phase = 'intro';
        this.levelCompleted = false;
        this.starsEarned = 0;
        await this.playPhaseIntro();
    }
    
    render() {
        this.element.innerHTML = `
            <div class="level3-scene" role="region" aria-label="第三關：準備上車">
                <header class="level-header">
                    <h2 class="level-title">
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.58-5.99zM6.5 7h11l1.53 3.54L17.53 12H6.47L5 8.54 6.5 7zm12 5H6v5h12v-5z"/></svg>
                        第三關：準備上車 ⭐⭐
                    </h2>
                    <div class="level-progress" aria-label="關卡進度">
                        <div class="progress-dot completed" aria-label="第一關完成"></div>
                        <div class="progress-dot completed" aria-label="第二關完成"></div>
                        <div class="progress-dot active" aria-label="第三關進行中"></div>
                        <div class="progress-dot" aria-label="第四關"></div>
                        <div class="progress-dot" aria-label="第五關"></div>
                    </div>
                </header>
                
                <main class="level-scene">
                    <div class="level3-bus-container" id="bus-container">
                        <!-- Canvas 疊加層：死角與內輪差演示 -->
                        <canvas class="canvas-overlay" id="danger-canvas" aria-label="校車死角與內輪差示意圖"></canvas>
                        
                        <!-- 校車圖片 -->
                        <img class="level3-bus" id="bus-image" src="assets/images/bg/level3-bus.svg" alt="校車正在靠近，車門關閉" loading="eager">
                        
                        <!-- 車門區域 (CSS 定位) -->
                        <div class="level3-door" id="bus-door" aria-hidden="true"></div>
                    </div>
                    
                    <div class="character" id="character" aria-hidden="true">
                        ${this.getCharacterSVG()}
                    </div>
                    
                    <!-- 等車按鈕 -->
                    <button class="btn btn-primary btn-large level3-wait-btn" id="wait-btn" style="display:none;" aria-label="等車完全停穩">
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        等車完全停穩
                    </button>
                </main>
                
                <!-- 上車方式選項 (等車停穩後顯示) -->
                <div class="options-area level3-options" id="entry-options" style="display:none;" role="group" aria-label="選擇上車方式">
                    <p style="text-align:center; color:var(--color-text-light); margin-bottom:var(--space-sm); font-weight:500;">車門已開啟，請選擇正確的上車方式</p>
                    
                    <button class="level3-option" data-choice="correct" role="button" tabindex="0">
                        <div class="level3-option-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        </div>
                        <span class="level3-option-text">依序排隊從車門上車</span>
                    </button>
                    
                    <button class="level3-option" data-choice="danger-front" role="button" tabindex="0">
                        <div class="level3-option-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        </div>
                        <span class="level3-option-text">從車前面跑過去上車</span>
                    </button>
                    
                    <button class="level3-option" data-choice="danger-back" role="button" tabindex="0">
                        <div class="level3-option-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        </div>
                        <span class="level3-option-text">從車後面跑過去上車</span>
                    </button>
                </div>
            </div>
        `;
        
        // 初始化 Canvas
        this.initCanvas();
    }
    
    initCanvas() {
        const canvas = this.$('#danger-canvas');
        const container = this.$('#bus-container');
        
        // 設定 Canvas 尺寸跟隨容器
        const resizeCanvas = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            this.drawDangerZones();
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        this.resizeHandler = resizeCanvas;
    }
    
    drawDangerZones() {
        const canvas = this.$('#danger-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        // 校車區域估算 (根據圖片比例調整)
        // 假設校車在畫面中央偏右，佔寬度 60%、高度 50%
        const busX = w * 0.2;
        const busY = h * 0.2;
        const busW = w * 0.6;
        const busH = h * 0.5;
        
        // 死角區域 (紅色半透明)
        const zones = [
            // 前方死角
            { x: busX + busW * 0.2, y: busY - h * 0.15, w: busW * 0.6, h: h * 0.15, label: '前方死角' },
            // 後方死角
            { x: busX + busW * 0.2, y: busY + busH, w: busW * 0.6, h: h * 0.15, label: '後方死角' },
            // 左側死角 (駕駛側)
            { x: busX - w * 0.1, y: busY + busH * 0.1, w: w * 0.1, h: busH * 0.8, label: '左側死角' },
            // 右側死角 (上下車側)
            { x: busX + busW, y: busY + busH * 0.1, w: w * 0.1, h: busH * 0.8, label: '右側死角' },
        ];
        
        // 繪製死角
        ctx.fillStyle = 'rgba(211, 47, 47, 0.35)';
        ctx.strokeStyle = '#D32F2F';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        
        zones.forEach(zone => {
            ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
            ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
            
            // 標籤
            ctx.fillStyle = '#D32F2F';
            ctx.font = 'bold 12px Noto Sans TC';
            ctx.textAlign = 'center';
            ctx.fillText(zone.label, zone.x + zone.w / 2, zone.y - 5);
            ctx.fillStyle = 'rgba(211, 47, 47, 0.35)';
        });
        
        ctx.setLineDash([]);
        
        // 內輪差區域 (轉彎時右後輪軌跡)
        // 假設校車右轉，右後輪會比車身更內側
        const innerWheelX = busX + busW * 0.7;
        const innerWheelY = busY + busH * 0.6;
        const innerWheelR = Math.min(w, h) * 0.12;
        
        // 內輪差弧形區域
        ctx.beginPath();
        ctx.arc(innerWheelX, innerWheelY, innerWheelR, Math.PI * 0.5, Math.PI * 1.5);
        ctx.lineTo(busX + busW, busY + busH * 0.6 - innerWheelR);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 152, 0, 0.25)';
        ctx.fill();
        
        // 內輪差路徑線
        ctx.beginPath();
        ctx.arc(innerWheelX, innerWheelY, innerWheelR, Math.PI * 0.5, Math.PI * 1.5);
        ctx.strokeStyle = '#E65100';
        ctx.lineWidth = 4;
        ctx.setLineDash([15, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 內輪差標籤
        ctx.fillStyle = '#E65100';
        ctx.font = 'bold 12px Noto Sans TC';
        ctx.textAlign = 'center';
        ctx.fillText('內輪差區域', innerWheelX, innerWheelY - innerWheelR - 10);
        
        // 動畫脈衝效果 (使用 CSS 動畫類別更好，這裡用簡單重繪)
        if (this.phase === 'dangerDemo') {
            requestAnimationFrame(() => this.drawDangerZones());
        }
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
        // 等車按鈕
        this.$('#wait-btn').addEventListener('click', () => this.onWaitBusClick());
        
        // 上車方式選項
        this.$$('.level3-option').forEach(btn => {
            btn.addEventListener('click', () => this.onEntrySelect(btn.dataset.choice));
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.onEntrySelect(btn.dataset.choice);
                }
            });
        });
    }
    
    unbindEvents() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        if (this.canvasAnimationId) {
            cancelAnimationFrame(this.canvasAnimationId);
        }
    }
    
    async playPhaseIntro() {
        // 階段 1：介紹死角
        await this.showDialog('qiedong', this.getDialog('level3.intro1'), { typewriter: true });
        await this.delay(2500);
        this.hideDialog();
        
        // 顯示死角動畫
        this.phase = 'dangerDemo';
        this.playSound('busHorn');
        this.$('#bus-image').classList.add('moving');
        
        await this.delay(2000);
        
        // 階段 2：介紹內輪差
        await this.showDialog('qiedong', this.getDialog('level3.intro2'), { typewriter: true });
        await this.delay(2500);
        this.hideDialog();
        
        // 階段 3：等車停穩
        this.$('#bus-image').classList.remove('moving');
        this.$('#bus-image').classList.add('stopped');
        this.$('#wait-btn').style.display = 'flex';
        
        await this.showDialog('qiedong', this.getDialog('level3.intro3'), { typewriter: true });
        await this.delay(2000);
        this.hideDialog();
        
        this.phase = 'waitBus';
    }
    
    async onWaitBusClick() {
        if (this.phase !== 'waitBus') return;
        
        this.playSound('click');
        this.playSound('engineStop');
        
        this.$('#wait-btn').disabled = true;
        this.$('#wait-btn').textContent = '車門開啟中...';
        this.$('#wait-btn').classList.remove('animate-btnPulse');
        
        // 車門打開動畫
        this.$('#bus-door').style.opacity = '1';
        
        await this.delay(1000);
        
        await this.showDialog('qiedong', this.getDialog('level3.doorOpen'), { typewriter: true });
        await this.delay(1500);
        this.hideDialog();
        
        // 顯示上車選項
        this.$('#entry-options').style.display = 'flex';
        this.phase = 'chooseEntry';
    }
    
    async onEntrySelect(choice) {
        if (this.phase !== 'chooseEntry' || this.levelCompleted) return;
        
        const btn = this.$(`[data-choice="${choice}"]`);
        this.playSound('click');
        
        if (choice === 'correct') {
            await this.onCorrectChoice(btn);
        } else {
            await this.onDangerChoice(btn, choice);
        }
    }
    
    async onCorrectChoice(btn) {
        btn.classList.add('correct');
        this.$$('#entry-options .level3-option').forEach(b => b.disabled = true);
        
        this.$('#character').classList.add('happy');
        
        this.playSound('correct');
        await this.showDialog('qiedong', this.getDialog('level3.correct'), { typewriter: true });
        
        this.addStar(2); // 核心關卡給 2 顆星
        this.starsEarned = 2;
        this.levelCompleted = true;
        
        await this.delay(2000);
        this.hideDialog();
        await this.changeScene('level4', { fromLevel: 'level3', starsEarned: 2 });
    }
    
    async onDangerChoice(btn, choice) {
        btn.classList.add('danger');
        this.$$('#entry-options .level3-option').forEach(b => b.disabled = true);
        
        this.$('#character').classList.add('sad');
        this.element.classList.add('animate-shake');
        
        this.playSound('danger');
        await this.delay(500);
        this.element.classList.remove('animate-shake');
        
        const dangerMessages = {
            'danger-front': this.getDialog('level3.dangerFront'),
            'danger-back': this.getDialog('level3.dangerBack')
        };
        
        await this.showModal({
            title: '危險！',
            icon: 'danger',
            body: dangerMessages[choice] || this.getDialog('level3.danger'),
            buttons: [
                { text: '重新選擇', class: 'btn-primary', fullWidth: true, onClick: () => this.resetEntryChoices() }
            ],
            closeOnOverlayClick: false,
            closeOnEscape: false
        });
    }
    
    resetEntryChoices() {
        this.$$('#entry-options .level3-option').forEach(btn => {
            btn.classList.remove('correct', 'danger');
            btn.disabled = false;
        });
        this.$('#character').classList.remove('happy', 'sad');
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}