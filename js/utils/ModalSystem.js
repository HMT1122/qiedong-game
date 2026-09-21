/**
 * ModalSystem - 模態彈窗系統
 * 安全小叮嚀、暫停選單、結果彈窗
 */

export class ModalSystem {
    constructor() {
        this.modalRoot = document.getElementById('modal-root');
        this.currentModal = null;
        this.focusStack = [];
        this.lastFocusedElement = null;
    }
    
    show(options = {}) {
        const {
            title = '',
            icon = 'info',
            body = '',
            buttons = [],
            closeOnOverlayClick = true,
            closeOnEscape = true,
            onClose
        } = options;
        
        // 記錄當前焦點元素
        this.lastFocusedElement = document.activeElement;
        
        // 建立模態框
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'modal-title');
        
        const iconSvgs = {
            info: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
            success: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`,
            danger: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
            warning: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
            pause: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
        };
        
        const iconColors = {
            info: 'var(--color-info)',
            success: 'var(--color-success)',
            danger: 'var(--color-danger)',
            warning: 'var(--color-warning)',
            pause: 'var(--color-primary)'
        };
        
        const modalClass = options.danger ? 'modal danger' : (options.success ? 'modal success' : 'modal');
        
        overlay.innerHTML = `
            <div class="${modalClass}" role="document">
                <div class="modal-header">
                    <div class="modal-icon" style="color: ${iconColors[icon] || iconColors.info};" aria-hidden="true">
                        ${iconSvgs[icon] || iconSvgs.info}
                    </div>
                    <h2 class="modal-title" id="modal-title">${title}</h2>
                    <button class="modal-close" aria-label="關閉">×</button>
                </div>
                <div class="modal-body">${body}</div>
                <div class="modal-footer"></div>
            </div>
        `;
        
        // 加入按鈕
        const footer = overlay.querySelector('.modal-footer');
        buttons.forEach((btn, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `btn ${btn.class || 'btn-primary'} ${btn.fullWidth ? '' : ''}`;
            button.textContent = btn.text;
            button.style.flex = btn.fullWidth ? '1' : 'auto';
            button.addEventListener('click', () => {
                const result = btn.onClick ? btn.onClick() : true;
                if (result !== false) {
                    this.hide();
                }
            });
            footer.appendChild(button);
        });
        
        // 關閉按鈕
        const closeBtn = overlay.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.hide());
        
        // 點擊遮罩關閉
        if (closeOnOverlayClick) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hide();
                }
            });
        }
        
        // ESC 鍵關閉
        if (closeOnEscape) {
            this.escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.hide();
                }
            };
            document.addEventListener('keydown', this.escapeHandler);
        }
        
        // 焦點管理
        this.trapFocus(overlay);
        
        // 顯示動畫
        this.modalRoot.appendChild(overlay);
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
            // 聚焦第一個按鈕或關閉按鈕
            const firstBtn = footer.querySelector('button') || closeBtn;
            firstBtn?.focus();
        });
        
        this.currentModal = { overlay, onClose, closeOnEscape };
        
        return new Promise(resolve => {
            this.currentModal.resolve = resolve;
        });
    }
    
    trapFocus(overlay) {
        const focusableElements = overlay.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        overlay.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
    
    hide() {
        if (!this.currentModal) return;
        
        const { overlay, onClose, closeOnEscape } = this.currentModal;
        
        // 移除事件監聽
        if (closeOnEscape && this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
        }
        
        // 隱藏動畫
        overlay.classList.remove('visible');
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            
            // 恢復焦點
            if (this.lastFocusedElement) {
                this.lastFocusedElement.focus();
            }
            
            if (onClose) onClose();
            if (this.currentModal.resolve) this.currentModal.resolve();
            
            this.currentModal = null;
        }, 250);
    }
    
    isVisible() {
        return this.currentModal !== null;
    }
    
    destroy() {
        this.hide();
        this.modalRoot.innerHTML = '';
    }
}