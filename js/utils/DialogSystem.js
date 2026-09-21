/**
 * DialogSystem - 對話框系統
 * 角色語音泡泡，支援逐字顯示動畫
 */

export class DialogSystem {
    constructor() {
        this.dialogElement = null;
        this.currentCharacter = null;
        this.typewriterInterval = null;
        this.isVisible = false;
        this.createDialogElement();
    }
    
    createDialogElement() {
        this.dialogElement = document.createElement('div');
        this.dialogElement.className = 'dialog-box';
        this.dialogElement.setAttribute('role', 'dialog');
        this.dialogElement.setAttribute('aria-live', 'polite');
        this.dialogElement.innerHTML = `
            <div class="dialog-header">
                <div class="dialog-avatar" aria-hidden="true"></div>
                <div class="dialog-name"></div>
            </div>
            <div class="dialog-text"></div>
        `;
        document.body.appendChild(this.dialogElement);
    }
    
    // ========================================
    // 顯示對話
    // ========================================
    show(character, text, options = {}) {
        const { 
            duration = 0, // 0 = 不自動關閉
            typewriter = true,
            typewriterSpeed = 30,
            onComplete 
        } = options;
        
        this.currentCharacter = character;
        this.isVisible = true;
        
        // 角色資料
        const charData = this.getCharacterData(character);
        
        // 更新頭像
        const avatar = this.dialogElement.querySelector('.dialog-avatar');
        avatar.innerHTML = charData.avatar;
        
        // 更新名稱
        const nameEl = this.dialogElement.querySelector('.dialog-name');
        nameEl.textContent = charData.name;
        
        // 更新文字
        const textEl = this.dialogElement.querySelector('.dialog-text');
        textEl.textContent = '';
        
        // 顯示動畫
        requestAnimationFrame(() => {
            this.dialogElement.classList.add('visible');
        });
        
        return new Promise(resolve => {
            let isResolved = false;
            const finish = () => {
                if (isResolved) return;
                isResolved = true;
                if (this.dialogElement) {
                    this.dialogElement.onclick = null;
                }
                if (onComplete) onComplete();
                if (duration > 0) {
                    setTimeout(() => {
                        this.hide();
                        resolve();
                    }, duration);
                } else {
                    resolve();
                }
            };
            
            // 點擊對話框可立即完成打字
            this.dialogElement.onclick = () => {
                if (this.typewriterInterval) {
                    clearInterval(this.typewriterInterval);
                    this.typewriterInterval = null;
                    textEl.textContent = text;
                    finish();
                }
            };
            
            // 打字機效果
            if (typewriter) {
                this.playTypewriter(text, textEl, typewriterSpeed, finish);
            } else {
                textEl.textContent = text;
                finish();
            }
        });
    }
    
    playTypewriter(text, element, speed, onComplete) {
        let index = 0;
        const chars = text.split('');
        
        this.typewriterInterval = setInterval(() => {
            if (index < chars.length) {
                element.textContent += chars[index];
                index++;
            } else {
                clearInterval(this.typewriterInterval);
                this.typewriterInterval = null;
                if (onComplete) onComplete();
            }
        }, speed);
    }
    
    // ========================================
    // 隱藏對話
    // ========================================
    hide() {
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }
        
        this.dialogElement.classList.remove('visible');
        this.isVisible = false;
        this.currentCharacter = null;
    }
    
    // ========================================
    // 角色資料
    // ========================================
    getCharacterData(character) {
        const characters = {
            qiedong: {
                name: '茄冬寶寶',
                avatar: `<svg viewBox="0 0 64 64" width="40" height="40"><circle cx="32" cy="28" r="20" fill="#4CAF50"/><ellipse cx="24" cy="22" rx="4" ry="5" fill="#1B5E20"/><ellipse cx="40" cy="22" rx="4" ry="5" fill="#1B5E20"/><path d="M24 35 Q32 42 40 35" stroke="#1B5E20" stroke-width="2" fill="none"/></svg>`
            },
            narrator: {
                name: '旁白',
                avatar: `<svg viewBox="0 0 64 64" width="40" height="40"><circle cx="32" cy="32" r="24" fill="#FF9800"/><path d="M20 32 Q32 20 44 32 Q32 44 20 32" fill="#FFF3E0"/></svg>`
            },
            driver: {
                name: '司機叔叔',
                avatar: `<svg viewBox="0 0 64 64" width="40" height="40"><circle cx="32" cy="26" r="18" fill="#795548"/><ellipse cx="24" cy="20" rx="4" ry="4" fill="#3E2723"/><ellipse cx="40" cy="20" rx="4" ry="4" fill="#3E2723"/><path d="M24 32 Q32 38 40 32" stroke="#3E2723" stroke-width="2" fill="none"/></svg>`
            },
            parent: {
                name: '爸爸媽媽',
                avatar: `<svg viewBox="0 0 64 64" width="40" height="40"><circle cx="22" cy="26" r="16" fill="#E91E63"/><circle cx="42" cy="26" r="16" fill="#2196F3"/><ellipse cx="18" cy="22" rx="3" ry="3" fill="#880E4F"/><ellipse cx="26" cy="22" rx="3" ry="3" fill="#880E4F"/><ellipse cx="38" cy="22" rx="3" ry="3" fill="#0D47A1"/><ellipse cx="46" cy="22" rx="3" ry="3" fill="#0D47A1"/></svg>`
            }
        };
        
        return characters[character] || characters.qiedong;
    }
    
    isShowing() {
        return this.isVisible;
    }
    
    destroy() {
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }
        if (this.dialogElement && this.dialogElement.parentNode) {
            this.dialogElement.parentNode.removeChild(this.dialogElement);
        }
    }
}