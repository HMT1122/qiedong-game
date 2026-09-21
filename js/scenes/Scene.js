/**
 * Scene - 場景基類
 * 所有場景繼承此類別，實作標準生命週期
 */

export class Scene {
    constructor(game) {
        this.game = game;
        this.element = null;
        this.isActive = false;
        this.animations = [];
    }
    
    // ========================================
    // 生命週期方法 (子類別覆寫)
    // ========================================
    
    // 場景進入時調用
    async onEnter(data = {}) {
        this.isActive = true;
        // 子類別需實作 render() 來填充 this.element 內容
        if (typeof this.render === 'function') {
            this.render();
        }
        this.bindEvents();
        await this.onEnterAsync(data);
    }
    
    // 非同步進入邏輯 (子類別覆寫)
    async onEnterAsync(data) {}
    
    // 場景退出時調用
    async onExit() {
        this.isActive = false;
        this.unbindEvents();
        this.cancelAnimations();
        await this.onExitAsync();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
    
    async onExitAsync() {}
    
    // 暫停/恢復
    onPauseChange(isPaused) {}
    
    // 每幀更新
    update(deltaTime) {}
    
    // ========================================
    // 基礎方法
    // ========================================
    
    createElement() {
        this.element = document.createElement('div');
        this.element.className = `scene scene-${this.constructor.name.toLowerCase().replace('scene', '')}`;
        this.element.setAttribute('role', 'region');
        this.element.setAttribute('aria-label', this.getSceneTitle());
    }
    
    getSceneTitle() {
        return '場景';
    }
    
    bindEvents() {}
    
    unbindEvents() {}
    
    // 動畫管理
    addAnimation(animation) {
        this.animations.push(animation);
    }
    
    cancelAnimations() {
        this.animations.forEach(anim => {
            if (anim.cancel) anim.cancel();
        });
        this.animations = [];
    }
    
    // 建立元素輔助
    createElementFromHTML(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    }
    
    // 安全查詢
    $(selector) {
        return this.element?.querySelector(selector);
    }
    
    $$(selector) {
        return this.element?.querySelectorAll(selector);
    }
    
    // 播放音效
    playSound(name) {
        this.game.playSound(name);
    }
    
    // 語音
    speak(text, options) {
        return this.game.speak(text, options);
    }
    
    // 對話框
    showDialog(character, text, options) {
        return this.game.showDialog(character, text, options);
    }
    
    hideDialog() {
        this.game.hideDialog();
    }
    
    // 模態框
    showModal(options) {
        return this.game.showModal(options);
    }
    
    hideModal() {
        this.game.hideModal();
    }
    
    // Toast
    showToast(message, type) {
        this.game.showToast(message, type);
    }
    
    // 取得對話文字
    getDialog(key) {
        if (!this.game) return key;
        return this.game.getDialog(key);
    }
    
    // 切換場景
    changeScene(sceneName, data) {
        return this.game.changeScene(sceneName, data);
    }
    
    // 星星
    addStar(count) {
        return this.game.addStar(count);
    }
    
    // 銷毀
    destroy() {
        this.cancelAnimations();
        this.unbindEvents();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}