/**
 * TTS - 語音合成系統 (Web Speech API)
 * 支援中文語音、語速調整、隊列播放
 */

export class TTS {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.queue = [];
        this.isSpeaking = false;
        this.enabled = true;
        this.voice = null;
        this.defaultOptions = {
            lang: 'zh-TW',
            rate: 0.9,
            pitch: 1.1,
            volume: 1.0
        };
        
        this.initVoices();
    }
    
    initVoices() {
        // 語音載入是非同步的，需要等待 voiceschanged 事件
        if (this.synthesis) {
            this.synthesis.onvoiceschanged = () => this.loadVoices();
            this.loadVoices();
        }
    }
    
    loadVoices() {
        const voices = this.synthesis.getVoices();
        
        // 優先選擇繁體中文語音
        this.voice = voices.find(v => v.lang === 'zh-TW' || v.lang === 'zh-Hant') ||
                     voices.find(v => v.lang.startsWith('zh')) ||
                     voices.find(v => v.name.includes('Chinese') || v.name.includes('Mandarin')) ||
                     voices[0];
        
        console.log('🗣️ TTS 語音載入完成:', this.voice ? this.voice.name : '無可用語音');
    }
    
    // ========================================
    // 核心播放方法
    // ========================================
    speak(text, options = {}) {
        if (!this.enabled || !this.synthesis || !text) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            // 如果正在說話，加入隊列
            if (this.isSpeaking) {
                this.queue.push({ text, options, resolve, reject });
                return;
            }
            
            this._speakNow(text, options, resolve, reject);
        });
    }
    
    _speakNow(text, options, resolve, reject) {
        if (!this.synthesis) {
            reject(new Error('SpeechSynthesis 不支援'));
            return;
        }
        
        // 取消當前播放
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || this.defaultOptions.lang;
        utterance.rate = options.rate ?? this.defaultOptions.rate;
        utterance.pitch = options.pitch ?? this.defaultOptions.pitch;
        utterance.volume = options.volume ?? this.defaultOptions.volume;
        
        if (this.voice) {
            utterance.voice = this.voice;
        }
        
        this.isSpeaking = true;
        
        utterance.onend = () => {
            this.isSpeaking = false;
            resolve();
            this._processQueue();
        };
        
        utterance.onerror = (event) => {
            this.isSpeaking = false;
            // 忽略 interrupted 錯誤 (被打斷是正常行為)
            if (event.error !== 'interrupted') {
                reject(new Error(`TTS 錯誤: ${event.error}`));
            } else {
                resolve();
            }
            this._processQueue();
        };
        
        this.synthesis.speak(utterance);
    }
    
    _processQueue() {
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            this._speakNow(next.text, next.options, next.resolve, next.reject);
        }
    }
    
    // ========================================
    // 控制方法
    // ========================================
    stop() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
        this.queue = [];
        this.isSpeaking = false;
    }
    
    pause() {
        if (this.synthesis && this.isSpeaking) {
            this.synthesis.pause();
        }
    }
    
    resume() {
        if (this.synthesis && this.isSpeaking) {
            this.synthesis.resume();
        }
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stop();
        }
    }
    
    isEnabled() {
        return this.enabled;
    }
    
    isSpeakingNow() {
        return this.isSpeaking;
    }
    
    getQueueLength() {
        return this.queue.length;
    }
    
    // ========================================
    // 設定
    // ========================================
    setDefaultOptions(options) {
        this.defaultOptions = { ...this.defaultOptions, ...options };
    }
    
    setVoice(voiceName) {
        const voices = this.synthesis.getVoices();
        const voice = voices.find(v => v.name === voiceName);
        if (voice) {
            this.voice = voice;
        }
    }
    
    getAvailableVoices() {
        return this.synthesis.getVoices().map(v => ({
            name: v.name,
            lang: v.lang,
            localService: v.localService,
            default: v.default
        }));
    }
    
    // ========================================
    // 清理
    // ========================================
    destroy() {
        this.stop();
        this.queue = [];
        this.enabled = false;
    }
}