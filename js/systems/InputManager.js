/**
 * InputManager - 統一輸入處理 (滑鼠 + 觸控)
 * 將所有輸入標準化為 pointer 事件
 */

export class InputManager {
    constructor() {
        this.pointer = {
            x: 0,
            y: 0,
            down: false,
            justDown: false,
            justUp: false,
            target: null,
            startX: 0,
            startY: 0,
            startTime: 0
        };
        
        this.keys = new Set();
        this.justPressed = new Set();
        this.justReleased = new Set();
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Pointer 事件 (統一滑鼠/觸控/筆)
        window.addEventListener('pointerdown', this.onPointerDown.bind(this), { passive: true });
        window.addEventListener('pointermove', this.onPointerMove.bind(this), { passive: true });
        window.addEventListener('pointerup', this.onPointerUp.bind(this), { passive: true });
        window.addEventListener('pointercancel', this.onPointerUp.bind(this), { passive: true });
        window.addEventListener('pointerleave', this.onPointerUp.bind(this), { passive: true });
        
        // 鍵盤事件
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // 防止右鍵選單 (遊戲中)
        window.addEventListener('contextmenu', (e) => {
            if (e.target.closest('#game-canvas')) {
                e.preventDefault();
            }
        });
    }
    
    onPointerDown(event) {
        // 忽略非主要按鈕 (右鍵、中鍵)
        if (event.button !== 0) return;
        
        this.pointer.down = true;
        this.pointer.justDown = true;
        this.pointer.target = event.target;
        this.pointer.startX = event.clientX;
        this.pointer.startY = event.clientY;
        this.pointer.startTime = performance.now();
        
        this.updatePointerPosition(event);
    }
    
    onPointerMove(event) {
        this.updatePointerPosition(event);
    }
    
    onPointerUp(event) {
        if (event.button !== 0) return;
        
        this.pointer.down = false;
        this.pointer.justUp = true;
        this.pointer.target = null;
    }
    
    updatePointerPosition(event) {
        this.pointer.x = event.clientX;
        this.pointer.y = event.clientY;
    }
    
    onKeyDown(event) {
        const key = event.key.toLowerCase();
        if (!this.keys.has(key)) {
            this.justPressed.add(key);
        }
        this.keys.add(key);
        
        // 防止空白鍵/方向鍵捲動頁面
        if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'escape'].includes(key)) {
            if (event.target.closest('#game-canvas') || event.target.tagName === 'BODY') {
                event.preventDefault();
            }
        }
    }
    
    onKeyUp(event) {
        const key = event.key.toLowerCase();
        this.keys.delete(key);
        this.justReleased.add(key);
    }
    
    // ========================================
    // 更新 (每幀調用)
    // ========================================
    update() {
        // 重置單幀狀態
        this.pointer.justDown = false;
        this.pointer.justUp = false;
        this.justPressed.clear();
        this.justReleased.clear();
    }
    
    // ========================================
    // 查詢方法
    // ========================================
    isPointerDown() {
        return this.pointer.down;
    }
    
    isPointerJustDown() {
        return this.pointer.justDown;
    }
    
    isPointerJustUp() {
        return this.pointer.justUp;
    }
    
    getPointerPosition() {
        return { x: this.pointer.x, y: this.pointer.y };
    }
    
    getPointerStartPosition() {
        return { x: this.pointer.startX, y: this.pointer.startY };
    }
    
    getPointerDelta() {
        return {
            x: this.pointer.x - this.pointer.startX,
            y: this.pointer.y - this.pointer.startY
        };
    }
    
    getPointerDuration() {
        return this.pointer.down ? performance.now() - this.pointer.startTime : 0;
    }
    
    isKeyDown(key) {
        return this.keys.has(key.toLowerCase());
    }
    
    isKeyJustPressed(key) {
        return this.justPressed.has(key.toLowerCase());
    }
    
    isKeyJustReleased(key) {
        return this.justReleased.has(key.toLowerCase());
    }
    
    // ========================================
    // 觸控手勢檢測
    // ========================================
    isTap(threshold = 10, maxDuration = 300) {
        return this.pointer.justUp && 
               this.getPointerDuration() < maxDuration &&
               Math.abs(this.getPointerDelta().x) < threshold &&
               Math.abs(this.getPointerDelta().y) < threshold;
    }
    
    isSwipe(minDistance = 50) {
        if (!this.pointer.justUp) return null;
        
        const delta = this.getPointerDelta();
        const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
        
        if (distance < minDistance) return null;
        
        const angle = Math.atan2(delta.y, delta.x) * 180 / Math.PI;
        
        if (angle >= -45 && angle < 45) return 'right';
        if (angle >= 45 && angle < 135) return 'down';
        if (angle >= 135 || angle < -135) return 'left';
        return 'up';
    }
    
    // ========================================
    // 元素碰撞檢測
    // ========================================
    isPointerOver(element) {
        if (!element || !this.pointer.down) return false;
        
        const rect = element.getBoundingClientRect();
        return this.pointer.x >= rect.left && 
               this.pointer.x <= rect.right && 
               this.pointer.y >= rect.top && 
               this.pointer.y <= rect.bottom;
    }
    
    getElementUnderPointer() {
        return document.elementFromPoint(this.pointer.x, this.pointer.y);
    }
    
    // ========================================
    // 清理
    // ========================================
    destroy() {
        window.removeEventListener('pointerdown', this.onPointerDown.bind(this));
        window.removeEventListener('pointermove', this.onPointerMove.bind(this));
        window.removeEventListener('pointerup', this.onPointerUp.bind(this));
        window.removeEventListener('pointercancel', this.onPointerUp.bind(this));
        window.removeEventListener('pointerleave', this.onPointerUp.bind(this));
        window.removeEventListener('keydown', this.onKeyDown.bind(this));
        window.removeEventListener('keyup', this.onKeyUp.bind(this));
    }
}