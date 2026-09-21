/**
 * Level5Scene - 第五關：下車
 * 教學重點：等車停、依序排隊、下車走到安全區域、再次提醒死角內輪差
 */

import { Scene } from './Scene.js';

export class Level5Scene extends Scene {
    constructor(game) {
        super(game);
        this.step = 0; // 0: 等車停, 1: 排隊下車, 2: 拖曳到安全區
        this.levelCompleted = false;
        this.dragActive = false;
    }
    
    getSceneTitle() {
        return '第五關：下車';
    }
    
    async onEnterAsync(data) {
        this.step = 0;
        this.levelCompleted = false;
        this.dragActive = false;
        await this.playIntroDialog();
    }
    
    render() {
        this.element.innerHTML = `
            <div class="level5-scene" role="region" aria-label="第五關：下車">
                <header class="level-header">
                    <h2 class="level-title">
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                        第五關：下車
                    </h2>
                    <div class="level-progress" aria-label="關卡進度">
                        <div class="progress-dot completed" aria-label="第一關完成"></div>
                        <div class="progress-dot completed" aria-label="第二關完成"></div>
                        <div class="progress-dot completed" aria-label="第三關完成"></div>
                        <div class="progress-dot completed" aria-label="第四關完成"></div>
                        <div class="progress-dot active" aria-label="第五關進行中"></div>
                    </div>
                </header>
                
                <main class="level-scene">
                    <img class="scene-bg level5-bg" src="assets/images/bg/level5-bus-arrival.svg" alt="校車到達學校，車門打開" loading="eager">
                    
                    <div class="character" id="character" aria-hidden="true">
                        ${this.getCharacterSVG()}
                    </div>
                </main>
                
                <!-- 步驟指引 -->
                <div class="level5-steps" id="steps" role="group" aria-label="下車步驟">
                    <div class="level5-step active" data-step="0" role="button" tabindex="0" aria-label="步驟1：等車完全停穩">
                        <div class="level5-step-number">1</div>
                        <span class="level5-step-text">等車完全停穩</span>
                    </div>
                    <div class="level5-step" data-step="1" role="button" tabindex="0" aria-label="步驟2：依序排隊下車">
                        <div class="level5-step-number">2</div>
                        <span class="level5-step-text">依序排隊下車</span>
                    </div>
                    <div class="level5-step" data-step="2" role="button" tabindex="0" aria-label="步驟3：走到安全區域">
                        <div class="level5-step-number">3</div>
                        <span class="level5-step-text">走到安全區域</span>
                    </div>
                </div>
                
                <!-- 拖曳區域 (步驟3顯示) -->
                <div class="drag-area level5-drag-area" id="drag-area" style="display:none;" role="application" aria-label="將茄冬寶寶拖曳到安全區域">
                    <div class="drag-target" id="drag-target" role="img" aria-label="茄冬寶寶，可拖曳" tabindex="0" draggable="true">
                        ${this.getCharacterSVG()}
                    </div>
                    
                    <!-- 安全區域 -->
                    <div class="drop-zone safe" id="safe-zone" style="top:20%; right:15%;" aria-label="安全區域：遠離車子、在人行道上">
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="#4CAF50" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        <span>安全區</span>
                    </div>
                    
                    <!-- 危險區域 (車前/車後) -->
                    <div class="drop-zone danger" id="danger-zone-front" style="top:30%; left:10%;" aria-label="危險區域：車前方死角">
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="#D32F2F" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                        <span>車前危險</span>
                    </div>
                    
                    <div class="drop-zone danger" id="danger-zone-back" style="top:30%; right:10%;" aria-label="危險區域：車後方死角">
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="#D32F2F" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                        <span>車後危險</span>
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
        // 步驟按鈕
        this.$$('.level5-step').forEach(step => {
            step.addEventListener('click', () => this.onStepClick(parseInt(step.dataset.step)));
            step.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.onStepClick(parseInt(step.dataset.step));
                }
            });
        });
        
        // 拖曳功能
        this.bindDragEvents();
    }
    
    bindDragEvents() {
        const dragTarget = this.$('#drag-target');
        const dragArea = this.$('#drag-area');
        
        if (!dragTarget || !dragArea) return;
        
        // 滑鼠事件
        this._mouseMoveHandler = (e) => this.onDrag(e);
        this._mouseUpHandler = (e) => this.endDrag(e);
        dragTarget.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', this._mouseMoveHandler);
        document.addEventListener('mouseup', this._mouseUpHandler);
        
        // 觸控事件
        this._touchMoveHandler = (e) => this.onDrag(e.touches[0]);
        this._touchEndHandler = (e) => this.endDrag(e.changedTouches[0]);
        dragTarget.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]), { passive: false });
        document.addEventListener('touchmove', this._touchMoveHandler, { passive: false });
        document.addEventListener('touchend', this._touchEndHandler);
        
        // 鍵盤支援 (方向鍵移動)
        dragTarget.addEventListener('keydown', (e) => this.onKeyDrag(e));

        // 友善設計：點擊安全區也能直接送達
        const safeZone = this.$('#safe-zone');
        if (safeZone) {
            safeZone.addEventListener('click', () => {
                if (this.step === 2 && !this.levelCompleted) {
                    this.onDropSuccess();
                }
            });
        }
    }

    unbindEvents() {
        if (this._mouseMoveHandler) {
            document.removeEventListener('mousemove', this._mouseMoveHandler);
            document.removeEventListener('mouseup', this._mouseUpHandler);
            document.removeEventListener('touchmove', this._touchMoveHandler);
            document.removeEventListener('touchend', this._touchEndHandler);
            this._mouseMoveHandler = null;
            this._mouseUpHandler = null;
            this._touchMoveHandler = null;
            this._touchEndHandler = null;
        }
    }
    
    startDrag(e) {
        if (this.step !== 2 || this.levelCompleted) return;
        e.preventDefault();
        
        this.dragActive = true;
        this.dragTarget = this.$('#drag-target');
        this.dragArea = this.$('#drag-area');
        
        this.dragTarget.classList.add('dragging');
        this.dragArea.classList.add('drag-over');
        
        const rect = this.dragTarget.getBoundingClientRect();
        this.dragOffsetX = e.clientX - rect.left;
        this.dragOffsetY = e.clientY - rect.top;
    }
    
    onDrag(e) {
        if (!this.dragActive) return;
        e.preventDefault();
        
        const areaRect = this.dragArea.getBoundingClientRect();
        let x = e.clientX - areaRect.left - this.dragOffsetX;
        let y = e.clientY - areaRect.top - this.dragOffsetY;
        
        // 限制在區域內
        const maxX = areaRect.width - this.dragTarget.offsetWidth;
        const maxY = areaRect.height - this.dragTarget.offsetHeight;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        
        this.dragTarget.style.left = x + 'px';
        this.dragTarget.style.top = y + 'px';
        this.dragTarget.style.position = 'absolute';
        
        // 檢查是否在安全區/危險區
        this.checkDropZone(x, y);
    }
    
    endDrag(e) {
        if (!this.dragActive) return;
        
        this.dragActive = false;
        this.dragTarget.classList.remove('dragging');
        this.dragArea.classList.remove('drag-over', 'drop-success', 'drop-danger');
        
        // 檢查最終位置
        const x = parseFloat(this.dragTarget.style.left) || 0;
        const y = parseFloat(this.dragTarget.style.top) || 0;
        
        const zone = this.checkDropZone(x, y, true);
        
        if (zone === 'safe') {
            this.onDropSuccess();
        } else if (zone === 'danger') {
            this.onDropDanger();
        } else {
            // 彈回原位
            this.dragTarget.style.left = '';
            this.dragTarget.style.top = '';
            this.dragTarget.style.position = '';
        }
    }
    
    onKeyDrag(e) {
        if (this.step !== 2 || this.levelCompleted) return;
        
        const step = 20;
        let x = parseFloat(this.$('#drag-target').style.left) || 0;
        let y = parseFloat(this.$('#drag-target').style.top) || 0;
        
        switch (e.key) {
            case 'ArrowUp': y -= step; break;
            case 'ArrowDown': y += step; break;
            case 'ArrowLeft': x -= step; break;
            case 'ArrowRight': x += step; break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.endDrag({ clientX: x, clientY: y });
                return;
            default: return;
        }
        
        e.preventDefault();
        const areaRect = this.$('#drag-area').getBoundingClientRect();
        const maxX = areaRect.width - this.$('#drag-target').offsetWidth;
        const maxY = areaRect.height - this.$('#drag-target').offsetHeight;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        
        this.$('#drag-target').style.left = x + 'px';
        this.$('#drag-target').style.top = y + 'px';
        this.$('#drag-target').style.position = 'absolute';
    }
    
    checkDropZone(x, y, final = false) {
        const target = this.$('#drag-target');
        const targetRect = {
            left: x,
            top: y,
            right: x + target.offsetWidth,
            bottom: y + target.offsetHeight
        };
        
        const zones = [
            { id: 'safe', el: this.$('#safe-zone'), type: 'safe' },
            { id: 'danger-front', el: this.$('#danger-zone-front'), type: 'danger' },
            { id: 'danger-back', el: this.$('#danger-zone-back'), type: 'danger' }
        ];
        
        let matchedZone = null;
        let safeMatched = false;
        
        zones.forEach(zone => {
            if (!zone.el) return;
            const rect = zone.el.getBoundingClientRect();
            const areaRect = this.$('#drag-area').getBoundingClientRect();

            const zoneRect = {
                left: rect.left - areaRect.left,
                top: rect.top - areaRect.top,
                right: rect.right - areaRect.left,
                bottom: rect.bottom - areaRect.top
            };

            // 檢查重疊
            const overlap = targetRect.left < zoneRect.right &&
                targetRect.right > zoneRect.left &&
                targetRect.top < zoneRect.bottom &&
                targetRect.bottom > zoneRect.top;

            if (overlap) {
                // 安全區優先：若已匹配 safe，不要被 danger 覆蓋
                if (zone.type === 'safe') {
                    matchedZone = zone;
                    safeMatched = true;
                } else if (!safeMatched) {
                    matchedZone = zone;
                }
            }
        });
        
        if (final && matchedZone) {
            return matchedZone.type;
        }
        
        // 視覺回饋
        if (matchedZone) {
            this.$('#drag-area').classList.add(matchedZone.type === 'safe' ? 'drop-success' : 'drop-danger');
        } else {
            this.$('#drag-area').classList.remove('drop-success', 'drop-danger');
        }
        
        return matchedZone?.type || null;
    }
    
    async onStepClick(stepNum) {
        if (this.levelCompleted) return;
        
        if (stepNum !== this.step) {
            this.playSound('error');
            this.showToast('請依序完成步驟', 'warning');
            return;
        }
        
        this.playSound('click');
        
        if (stepNum === 0) {
            // 步驟 1：等車停穩
            await this.showDialog('qiedong', this.getDialog('level5.step1'), { typewriter: true });
            await this.delay(1500);
            this.hideDialog();
            this.nextStep();
        } else if (stepNum === 1) {
            // 步驟 2：排隊下車
            await this.showDialog('qiedong', this.getDialog('level5.step2'), { typewriter: true });
            await this.delay(1500);
            this.hideDialog();
            this.nextStep();
        }
    }
    
    nextStep() {
        // 更新步驟狀態
        this.$$('.level5-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < this.step) step.classList.add('completed');
            if (index === this.step) step.classList.add('active');
        });
        
        this.step++;
        
        if (this.step === 2) {
            // 步驟 3：顯示拖曳區域
            this.$('#drag-area').style.display = 'block';
            this.$('#drag-area').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            this.playSound('click');
            this.showDialog('qiedong', this.getDialog('level5.step3'), { typewriter: true });
        }
    }
    
    async onDropSuccess() {
        this.playSound('correct');
        this.$('#drag-area').classList.add('drop-success');
        this.$('#drag-target').style.pointerEvents = 'none';
        
        await this.showDialog('qiedong', this.getDialog('level5.success'), { typewriter: true });
        
        if (!this.game.stateManager.isLevelCompleted('level5')) {
            this.addStar(1);
        }
        this.game.stateManager.completeLevel('level5');
        this.levelCompleted = true;
        
        await this.delay(2000);
        this.hideDialog();
        await this.changeScene('ending', { fromLevel: 'level5', allCompleted: true });
    }
    
    async onDropDanger() {
        this.playSound('danger');
        this.$('#drag-area').classList.add('drop-danger');
        
        // 角色悲傷
        this.$('#character').classList.add('sad');
        
        await this.showModal({
            title: '危險！',
            icon: 'danger',
            body: this.getDialog('level5.danger'),
            buttons: [
                { text: '重新嘗試', class: 'btn-primary', fullWidth: true, onClick: () => this.resetDrag() }
            ],
            closeOnOverlayClick: false,
            closeOnEscape: false
        });
    }
    
    resetDrag() {
        this.$('#drag-target').style.left = '';
        this.$('#drag-target').style.top = '';
        this.$('#drag-target').style.position = '';
        this.$('#drag-target').style.pointerEvents = 'auto';
        this.$('#drag-area').classList.remove('drop-success', 'drop-danger');
        this.$('#character').classList.remove('sad');
    }
    
    async playIntroDialog() {
        await this.showDialog('qiedong', this.getDialog('level5.intro'), { typewriter: true });
        await this.delay(2000);
        this.hideDialog();
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}