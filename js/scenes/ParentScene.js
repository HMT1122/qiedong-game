/**
 * ParentScene - 親子共學頁面
 * 強調「小手牽大手」，把知識帶給家長
 */

import { Scene } from './Scene.js';

export class ParentScene extends Scene {
    constructor(game) {
        super(game);
    }
    
    getSceneTitle() {
        return '親子共學：小手牽大手';
    }
    
    async onEnterAsync(data) {
        await this.playIntroDialog();
    }
    
    render() {
        this.element.innerHTML = `
            <div class="parent-scene" role="region" aria-label="親子共學頁面">
                <div class="parent-content">
                    <div class="parent-card">
                        <h2 class="parent-title">
                            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M12 21c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8zm0-16c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            小手牽大手
                        </h2>
                        
                        <p class="parent-text">
                            親愛的爸爸媽媽，<br>
                            孩子已經學會了上學途中的交通安全知識！<br>
                            請一起複習以下重點，攜手守護孩子平安上下學。
                        </p>
                        
                        <div class="parent-points" role="list" aria-label="交通安全八大重點">
                            ${this.getParentPoints().map((point, index) => `
                                <div class="parent-point" role="listitem">
                                    <span class="parent-point-number">${index + 1}</span>
                                    <span class="parent-point-text">${point}</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div style="margin-top:var(--space-xl); padding-top:var(--space-lg); border-top:2px solid var(--color-border);">
                            <p style="color:var(--color-text-light); font-size:var(--font-size-sm); line-height:1.7;">
                                💡 <strong>給家長的建議：</strong><br>
                                • 每天上下學時，陪伴孩子實際演練一次<br>
                                • 遇到大型車時，主動拉遠距離、解說內輪差<br>
                                • 讓孩子說出「停、看、聽、走」四步驟<br>
                                • 讚賞孩子的安全行為，建立正向回饋
                            </p>
                        </div>
                        
                        <button class="btn btn-primary btn-large" id="back-menu-btn" style="margin-top:var(--space-lg);">
                            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                            回主選單
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    getParentPoints() {
        return [
            '走路走在人行道，不在馬路上玩耍',
            '過馬路要「停、看、聽、走」，不要抄近道',
            '等校車站在安全候車區，離馬路要有距離',
            '一定要等校車完全停穩、車門打開才能上車',
            '絕對不要從校車前方或後方跑過去（司機看不見！)',
            '大型車轉彎有內輪差，後輪會比車身更內側，要離遠一點',
            '車上要繫安全帶、安靜坐好、不把手腳伸出窗外',
            '下車後走到安全區域（人行道、綠色標線），不要在車旁停留'
        ];
    }
    
    async playIntroDialog() {
        await this.showDialog('parent', this.getDialog('parent.intro'), { typewriter: true });
        await this.delay(3000);
        this.hideDialog();
    }
    
    bindEvents() {
        this.$('#back-menu-btn').addEventListener('click', () => this.onBackClick());
    }
    
    async onBackClick() {
        this.playSound('click');
        await this.changeScene('menu');
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}