/**
 * AudioSystem - Web Audio API 音效合成系統
 * 零外部音檔依賴，完全用程式碼合成所有音效
 */

export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.isMuted = false;
        this.masterGain = null;
        this.soundCache = new Map();
        this.initialized = false;
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            // 建立 AudioContext (需要用戶互動後才能啟動)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 主音量控制
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.audioContext.destination);
            
            // 預先合成常用音效
            this.prewarmSounds();
            
            this.initialized = true;
            console.log('🔊 AudioSystem 初始化完成');
        } catch (error) {
            console.warn('AudioContext 初始化失敗，音效將無法播放:', error);
        }
    }
    
    // 確保 AudioContext 運行 (需在用戶互動後調用)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    prewarmSounds() {
        // 預先生成所有音效的 AudioBuffer (可選，這裡用即時合成)
        // 這裡只定義音效參數，實際播放時合成
    }
    
    // ========================================
    // 核心播放方法
    // ========================================
    play(soundName, options = {}) {
        if (this.isMuted || !this.audioContext) return;
        
        this.resume();
        
        const soundFn = this.soundGenerators[soundName];
        if (soundFn) {
            soundFn.call(this, options);
        } else {
            console.warn(`未定義的音效: ${soundName}`);
        }
    }
    
    // ========================================
    // 音效合成器
    // ========================================
    get soundGenerators() {
        return {
            // 正確選擇 - 開心叮咚聲
            correct: (options) => this.playTone({
                type: 'sine',
                frequency: [800, 1200],
                duration: 0.3,
                volume: 0.5,
                ...options
            }),
            
            // 錯誤選擇 - 警報聲
            error: (options) => this.playTone({
                type: 'square',
                frequency: [400, 800],
                duration: 0.5,
                volume: 0.6,
                ...options
            }),
            
            // 收集星星
            star: (options) => this.playTone({
                type: 'sine',
                frequency: [1000, 1500],
                duration: 0.2,
                volume: 0.4,
                ...options
            }),
            
            // 校車喇叭
            busHorn: (options) => this.playTone({
                type: 'sawtooth',
                frequency: [300, 450],
                duration: 0.8,
                volume: 0.5,
                ...options
            }),
            
            // 車輛啟動
            engineStart: (options) => this.playEngineSound('start', options),
            
            // 車輛停止
            engineStop: (options) => this.playEngineSound('stop', options),
            
            // 通關掌聲
            applause: (options) => this.playNoise({
                type: 'applause',
                duration: 1.5,
                volume: 0.4,
                ...options
            }),
            
            // 按鈕點擊
            click: (options) => this.playTone({
                type: 'square',
                frequency: 600,
                duration: 0.1,
                volume: 0.3,
                ...options
            }),
            
            // 危險警報 (更強烈)
            danger: (options) => this.playTone({
                type: 'square',
                frequency: [300, 600, 300, 600],
                duration: 1.0,
                volume: 0.7,
                ...options
            }),
            
            // 成功完成關卡
            levelComplete: (options) => this.playSequence([
                { frequency: 523, duration: 0.15 }, // C5
                { frequency: 659, duration: 0.15 }, // E5
                { frequency: 784, duration: 0.15 }, // G5
                { frequency: 1047, duration: 0.3 }  // C6
            ], options),
            
            // 遊戲開始
            gameStart: (options) => this.playSequence([
                { frequency: 392, duration: 0.2 },  // G4
                { frequency: 523, duration: 0.2 },  // C5
                { frequency: 659, duration: 0.3 }   // E5
            ], options),
        };
    }
    
    // ========================================
    // 基礎合成方法
    // ========================================
    playTone({ type = 'sine', frequency = 440, duration = 0.5, volume = 0.5, attack = 0.01, decay = 0.1, sustain = 0.3, release = 0.2 }) {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const frequencies = Array.isArray(frequency) ? frequency : [frequency];
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = type;
            oscillator.frequency.value = freq;
            
            gainNode.connect(this.masterGain);
            oscillator.connect(gainNode);
            
            const startTime = now + index * 0.05;
            const endTime = startTime + duration;
            
            // ADSR 包絡
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(volume, startTime + attack);
            gainNode.gain.linearRampToValueAtTime(volume * sustain, startTime + attack + decay);
            gainNode.gain.linearRampToValueAtTime(0, endTime);
            
            oscillator.start(startTime);
            oscillator.stop(endTime + release);
        });
    }
    
    playSequence(notes, options = {}) {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        let currentTime = now;
        const volume = options.volume || 0.5;
        const type = options.type || 'sine';
        
        notes.forEach(note => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = type;
            oscillator.frequency.value = note.frequency;
            
            gainNode.connect(this.masterGain);
            oscillator.connect(gainNode);
            
            const duration = note.duration || 0.2;
            const attack = 0.01;
            
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, currentTime + attack);
            gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);
            
            oscillator.start(currentTime);
            oscillator.stop(currentTime + duration);
            
            currentTime += duration;
        });
    }
    
    playEngineSound(type, options = {}) {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const duration = options.duration || (type === 'start' ? 1.0 : 0.5);
        const volume = options.volume || 0.3;
        
        // 低頻基音
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc1.type = 'sawtooth';
        osc1.frequency.value = 60;
        osc2.type = 'square';
        osc2.frequency.value = 120;
        
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        filter.Q.value = 2;
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        if (type === 'start') {
            // 啟動：頻率上升
            osc1.frequency.setValueAtTime(40, now);
            osc1.frequency.exponentialRampToValueAtTime(80, now + 0.5);
            osc2.frequency.setValueAtTime(80, now);
            osc2.frequency.exponentialRampToValueAtTime(160, now + 0.5);
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.1);
            gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + duration);
        } else {
            // 停止：頻率下降
            osc1.frequency.setValueAtTime(80, now);
            osc1.frequency.exponentialRampToValueAtTime(30, now + duration);
            osc2.frequency.setValueAtTime(160, now);
            osc2.frequency.exponentialRampToValueAtTime(60, now + duration);
            
            gainNode.gain.setValueAtTime(volume * 0.3, now);
            gainNode.gain.linearRampToValueAtTime(0, now + duration);
        }
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration + 0.1);
        osc2.stop(now + duration + 0.1);
    }
    
    playNoise({ type = 'white', duration = 1.0, volume = 0.3, envelope = 'decay' }) {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // 生成白噪音
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (envelope === 'decay' ? (1 - i / bufferSize) : 1);
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        filter.type = type === 'applause' ? 'bandpass' : 'highpass';
        filter.frequency.value = type === 'applause' ? 2000 : 1000;
        filter.Q.value = type === 'applause' ? 0.5 : 1;
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        if (envelope === 'decay') {
            gainNode.gain.setValueAtTime(volume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        } else {
            gainNode.gain.value = volume;
        }
        
        source.start(now);
        source.stop(now + duration);
    }
    
    // ========================================
    // 音量控制
    // ========================================
    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
    
    getMasterVolume() {
        return this.masterGain ? this.masterGain.gain.value : 0;
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : 0.7;
        }
        return this.isMuted;
    }
    
    isMutedState() {
        return this.isMuted;
    }
    
    // ========================================
    // 清理
    // ========================================
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.masterGain = null;
        this.soundCache.clear();
        this.initialized = false;
    }
}