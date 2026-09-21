/**
 * EndingScene - 結局總複習
 * 顯示收集的星星、重點總結、再玩一次/分享
 */

import { Scene } from './Scene.js';

export class EndingScene extends Scene {
    constructor(game) {
        super(game);
    }
    
    getSceneTitle() {
        return '結局：交通小達人';
    }
    
    async onEnterAsync(data) {
        await this.playEndingSequence(data);
    }
    
    render() {
        const stars = this.game.getStars();
        const maxStars = this.game.stateManager.getMaxStars();
        
        this.element.innerHTML = `
            <div class="ending-scene" role="region" aria-label="結局總複習">
                <div class="ending-content">
                    <div class="ending-character" aria-hidden="true">
                        ${this.getCharacterSVG('celebrate')}
                    </div>
                    
                    <h1 class="ending-title">恭喜你！</h1>
                    <p style="font-size:var(--font-size-lg); color:var(--color-text); margin-bottom:var(--space-lg);">
                        你已經跟茄冬寶寶一起學會安全搭校車了！
                    </p>
                    
                    <div class="ending-stars" aria-label="收集到的安全星星">
                        ${[1,2,3,4,5,6].map(i => `
                            <svg class="ending-star ${i <= stars ? 'earned' : ''}" viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
                                <path fill="#FFD700" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                        `).join('')}
                    </div>
                    
                    <p style="font-size:var(--font-size-xl); font-weight:700; color:var(--color-primary);">
                        你現在是<span class="highlight">交通小達人</span>！
                    </p>
                    
                    <!-- 重點總結 -->
                    <div class="ending-summary" role="region" aria-label="安全重點總結">
                        ${this.getSummaryItems().map((item, index) => `
                            <div class="summary-item" style="animation-delay:${index * 100}ms">
                                <div class="summary-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                </div>
                                <span class="summary-text">${item}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- 操作按鈕 -->
                    <div style="display:flex; flex-direction:column; gap:var(--space-md); width:100%; margin-top:var(--space-lg);">
                        <button class="btn btn-primary btn-large" id="parent-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                            小手牽大手・親子共學
                        </button>
                        <button class="btn btn-secondary btn-large" id="replay-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8V7c0-3.31-2.69-6-6-6zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
                            再玩一次
                        </button>
                        <button class="btn btn-secondary btn-large" id="share-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81L7.12 14.7c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-.23-.03-.45-.08-.65l7.05 4.11c-.52.47-1.23.78-2.02.78z"/></svg>
                            分享給同學／家長
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    getCharacterSVG(mood = 'happy') {
        const eyeClass = mood === 'celebrate' ? 'eye-happy' : 'blink';
        const mouthPath = mood === 'celebrate' 
            ? 'M40 60 Q60 75 80 60' 
            : 'M50 55 Q60 65 70 55';
        
        return `
            <svg viewBox="0 0 120 120" class="qiedong-character" width="200" height="200">
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
    
    getSummaryItems() {
        return [
            '走路走在安全的地方（人行道）',
            '過馬路記得「停、看、聽、走」四步驟',
            '等車站在安全候車區（離馬路有距離）',
            '等校車完全停穩才能上車',
            '絕對不要從校車前面或後面跑過去（死角超危險！）',
            '大型車有內輪差，轉彎時更要小心',
            '車上安靜坐好、不走動、輕聲說話',
            '下車等車停、依序排隊、走到安全區域'
        ];
    }
    
    async playEndingSequence(data) {
        this.playSound('applause');
        
        // 逐項顯示星星
        const stars = this.$$('.ending-star');
        for (let i = 0; i < stars.length; i++) {
            await this.delay(200);
            if (i < this.game.getStars()) {
                stars[i].classList.add('earned');
                this.playSound('star');
            }
        }
        
        await this.delay(500);
        
        await this.showDialog('qiedong', this.getDialog('ending.congrats'), { typewriter: true });
        await this.delay(3000);
        this.hideDialog();
    }
    
    bindEvents() {
        this.$('#parent-btn').addEventListener('click', () => this.onParentClick());
        this.$('#replay-btn').addEventListener('click', () => this.onReplayClick());
        this.$('#share-btn').addEventListener('click', () => this.onShareClick());
    }
    
    async onParentClick() {
        this.playSound('click');
        await this.changeScene('parent');
    }
    
    async onReplayClick() {
        this.playSound('click');
        // 重置進度
        this.game.stateManager.resetProgress();
        await this.changeScene('menu');
    }
    
    async onShareClick() {
        this.playSound('click');
        
        const shareText = `我完成了「茄冬寶寶上學安全日記」！🌟 學會了停看聽走、校車死角、內輪差等交通安全知識，成為交通小達人了！快來一起玩吧！`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '茄冬寶寶上學安全日記',
                    text: shareText,
                    url: window.location.origin
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    this.fallbackShare(shareText);
                }
            }
        } else {
            this.fallbackShare(shareText);
        }
    }
    
    fallbackShare(text) {
        // 複製到剪貼簿
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('分享文字已複製到剪貼簿！', 'success');
        }).catch(() => {
            this.showModal({
                title: '分享遊戲',
                icon: 'info',
                body: `<p>請手動複製以下文字分享給朋友：</p><textarea readonly style="width:100%; min-height:100px; padding:var(--space-md); border-radius:var(--radius-md); border:2px solid var(--color-border); font-family:inherit; font-size:var(--font-size-sm);">${text}</textarea>`,
                buttons: [{ text: '關閉', class: 'btn-primary', fullWidth: true }]
            });
        });
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}