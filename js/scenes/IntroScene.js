/**
 * IntroScene - 開場動畫場景
 *
 * 流程：
 * 1. 顯示開場畫面 (角色 + 標題 + 背景)
 * 2. 自動播放語音台詞 (3 段)
 * 3. 等待使用者點擊「開始上學」按鈕
 * 4. 點擊後跳到主選單
 */

import { Scene } from './Scene.js';

export class IntroScene extends Scene {
    constructor(game) {
        super(game);
        this.skipRequested = false;
        this.dialogTimer = null;
        this.currentDialogIndex = 0;
        this.dialogs = [
            'intro.greeting',
            'intro.mission',
            'intro.ready'
        ];
        this.typewriterInterval = null;
    }

    getSceneTitle() {
        return '開場動畫';
    }

    async onEnterAsync(data) {
        // 首次造訪標記
        if (this.game.stateManager.isFirstVisit()) {
            this.game.stateManager.markVisited();
        }

        // 注意：render() 已在 Scene.onEnter 內呼叫
        // 此處只做按鈕事件綁定與背景台詞播放

        // 綁定按鈕事件
        try {
            this.bindButtonEvent();
        } catch (err) {
            console.error('[IntroScene] 按鈕綁定失敗:', err);
        }

        // 播放開場台詞序列 (背景進行，不阻塞)
        this.playIntroSequence().catch(err => {
            console.warn('[IntroScene] 台詞播放失敗 (非致命):', err);
        });

    }

    render() {
        // 清空 element 再寫入
        this.element.innerHTML = `
            <div class="intro-scene" role="region" aria-label="開場動畫">
                <img class="intro-bg" src="assets/images/bg/intro-school.svg" alt="茄苳國小校門口" loading="eager">
                <div class="intro-content">
                    <div class="intro-character" aria-hidden="true">
                        ${this.getCharacterSVG()}
                    </div>
                    <h1 class="intro-title">茄冬寶寶上學安全日記</h1>
                    <p class="intro-subtitle">桃園茄苳國小 交通安全扎根教育</p>
                    <div class="intro-dialog" role="dialog" aria-live="polite">
                        <p class="intro-dialog-text" id="intro-dialog-text"></p>
                    </div>
                    <button class="btn btn-primary btn-large intro-btn" id="start-btn" aria-label="開始上學">
                        開始上學
                    </button>
                </div>
            </div>
        `;
    }

    getCharacterSVG() {
        return `
            <svg viewBox="0 0 120 120" class="qiedong-character" width="180" height="180" aria-hidden="true">
                <circle cx="60" cy="55" r="35" fill="#2E7D32" opacity="0.2"/>
                <ellipse cx="60" cy="50" rx="28" ry="25" fill="#4CAF50" class="body-bounce"/>
                <ellipse cx="50" cy="42" rx="6" ry="7" fill="#1B5E20" class="eye-left blink"/>
                <ellipse cx="70" cy="42" rx="6" ry="7" fill="#1B5E20" class="eye-right blink"/>
                <path d="M50 55 Q60 65 70 55" stroke="#1B5E20" stroke-width="3" fill="none" class="mouth-smile"/>
                <path d="M35 50 Q25 40 20 45" stroke="#2E7D32" stroke-width="4" fill="none" class="leaf-left wave"/>
                <path d="M85 50 Q95 40 100 45" stroke="#2E7D32" stroke-width="4" fill="none" class="leaf-right wave"/>
            </svg>
        `;
    }

    bindButtonEvent() {
        const startBtn = this.$('#start-btn');
        if (!startBtn) {
            console.error('找不到 start-btn');
            return;
        }
        // 點擊事件用箭頭函式綁定 this
        this._startHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.onStartClick();
        };
        startBtn.addEventListener('click', this._startHandler);

        // 鍵盤 Enter 觸發
        this._keyHandler = (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !this.skipRequested) {
                e.preventDefault();
                this.onStartClick();
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    unbindEvents() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }
        if (this.dialogTimer) {
            clearTimeout(this.dialogTimer);
            this.dialogTimer = null;
        }
        this.hideDialog();
    }

    onStartClick() {
        if (this.skipRequested) return;
        this.skipRequested = true;

        this.playSound('click');

        const btn = this.$('#start-btn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '準備出發...';
        }

        // 停止語音與動畫
        this.speak(''); // 停止 TTS
        this.hideDialog();

        // 短暫延遲讓使用者看到按鈕變化，然後跳 menu
        this.dialogTimer = setTimeout(() => {
            this.changeScene('menu').catch(err => {
                console.error('切換到 menu 失敗:', err);
            });
        }, 600);
    }

    async playIntroSequence() {
        // 依序播放 3 段台詞 (寫入 intro-dialog-text，不用 DialogSystem 避免衝突)
        const textEl = this.$('#intro-dialog-text');
        if (!textEl) return;

        for (let i = 0; i < this.dialogs.length; i++) {
            if (this.skipRequested) break;

            this.currentDialogIndex = i;
            const text = this.getDialog(this.dialogs[i]);

            // 打字機效果寫入 intro-dialog-text
            await this.typewriteText(textEl, text, 25);

            if (this.skipRequested) break;

            // 同時觸發 TTS 語音 (背景)
            this.speak(text).catch(() => {});

            // 等 3 秒或被跳過
            await this.waitOrSkip(3000);

            if (this.skipRequested) break;

            // 清空，等下一段
            textEl.textContent = '';
            await this.delay(300);
        }
    }

    /**
     * 打字機效果寫入指定元素
     */
    typewriteText(element, text, speed = 25) {
        return new Promise(resolve => {
            if (this.typewriterInterval) {
                clearInterval(this.typewriterInterval);
            }
            element.textContent = '';
            let index = 0;
            this.typewriterInterval = setInterval(() => {
                if (this.skipRequested) {
                    clearInterval(this.typewriterInterval);
                    this.typewriterInterval = null;
                    element.textContent = text;
                    resolve();
                    return;
                }
                if (index < text.length) {
                    element.textContent += text[index];
                    index++;
                } else {
                    clearInterval(this.typewriterInterval);
                    this.typewriterInterval = null;
                    resolve();
                }
            }, speed);
        });
    }

    /**
     * 等 ms 毫秒或直到 skipRequested
     */
    waitOrSkip(ms) {
        return new Promise(resolve => {
            const start = Date.now();
            const check = () => {
                if (this.skipRequested || Date.now() - start >= ms) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}