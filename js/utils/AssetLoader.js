/**
 * AssetLoader - 圖片/資源預載入器
 * 支援進度回呼、快取、失敗重試
 */

export class AssetLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
    }
    
    // ========================================
    // 圖片載入
    // ========================================
    loadImage(src, options = {}) {
        const { 
            retries = 2, 
            timeout = 10000,
            crossOrigin = 'anonymous'
        } = options;
        
        // 檢查快取
        if (this.cache.has(src)) {
            return Promise.resolve(this.cache.get(src));
        }
        
        // 檢查是否正在載入
        if (this.loadingPromises.has(src)) {
            return this.loadingPromises.get(src);
        }
        
        const promise = this._loadImageWithRetry(src, retries, timeout, crossOrigin);
        this.loadingPromises.set(src, promise);
        
        promise.finally(() => {
            this.loadingPromises.delete(src);
        });
        
        return promise;
    }
    
    _loadImageWithRetry(src, retries, timeout, crossOrigin) {
        return new Promise((resolve, reject) => {
            const attemptLoad = (attempt) => {
                const img = new Image();
                
                if (crossOrigin) {
                    img.crossOrigin = crossOrigin;
                }
                
                const timeoutId = setTimeout(() => {
                    img.onload = null;
                    img.onerror = null;
                    if (attempt < retries) {
                        console.warn(`圖片載入逾時，重試 ${attempt + 1}/${retries}: ${src}`);
                        attemptLoad(attempt + 1);
                    } else {
                        reject(new Error(`圖片載入逾時: ${src}`));
                    }
                }, timeout);
                
                img.onload = () => {
                    clearTimeout(timeoutId);
                    this.cache.set(src, img);
                    resolve(img);
                };
                
                img.onerror = () => {
                    clearTimeout(timeoutId);
                    if (attempt < retries) {
                        console.warn(`圖片載入失敗，重試 ${attempt + 1}/${retries}: ${src}`);
                        attemptLoad(attempt + 1);
                    } else {
                        reject(new Error(`圖片載入失敗: ${src}`));
                    }
                };
                
                img.src = src;
            };
            
            attemptLoad(0);
        });
    }
    
    // 批次載入多張圖片
    loadImages(sources, onProgress) {
        const promises = sources.map((src, index) => 
            this.loadImage(src).then(img => {
                if (onProgress) {
                    onProgress((index + 1) / sources.length, src);
                }
                return { src, img };
            }).catch(error => {
                if (onProgress) {
                    onProgress((index + 1) / sources.length, src);
                }
                return { src, error };
            })
        );
        
        return Promise.all(promises);
    }
    
    // 預載場景所需資源
    async preloadSceneAssets(sceneName, onProgress) {
        const sceneAssets = this.getSceneAssetList(sceneName);
        return this.loadImages(sceneAssets, onProgress);
    }
    
    // 場景資源清單 (實際專案中應從資料檔讀取)
    getSceneAssetList(sceneName) {
        const basePath = 'assets/images/';
        const common = [
            `${basePath}character/qiedong.png`,
            `${basePath}character/qiedong-happy.png`,
            `${basePath}character/qiedong-sad.png`,
            `${basePath}ui/star.png`,
            `${basePath}ui/star-empty.png`
        ];
        
        const sceneSpecific = {
            intro: [`${basePath}bg/intro-school.svg`],
            menu: [`${basePath}bg/menu-school.svg`],
            level1: [
                `${basePath}bg/level1-road.svg`,
                `${basePath}objects/car.png`,
                `${basePath}objects/crosswalk.png`
            ],
            level2: [
                `${basePath}bg/level2-bus-stop.svg`,
                `${basePath}objects/bus-stop-safe.svg`,
                `${basePath}objects/bus-stop-danger1.svg`,
                `${basePath}objects/bus-stop-danger2.svg`
            ],
            level3: [
                `${basePath}bg/level3-bus.svg`,
                `${basePath}objects/school-bus.png`,
                `${basePath}objects/bus-door.png`
            ],
            level4: [
                `${basePath}bg/level4-bus-inside.svg`
            ],
            level5: [
                `${basePath}bg/level5-bus-arrival.svg`,
                `${basePath}objects/safe-zone.png`,
                `${basePath}objects/danger-zone.png`
            ],
            ending: [`${basePath}bg/ending-school.svg`],
            parent: [`${basePath}bg/parent-learning.svg`]
        };
        
        return [...common, ...(sceneSpecific[sceneName] || [])];
    }
    
    // 預載所有關卡資源
    async preloadAll(onProgress) {
        const allScenes = ['intro', 'menu', 'level1', 'level2', 'level3', 'level4', 'level5', 'ending', 'parent'];
        let loaded = 0;
        const total = allScenes.length;
        
        for (const scene of allScenes) {
            await this.preloadSceneAssets(scene);
            loaded++;
            if (onProgress) onProgress(loaded / total, scene);
        }
    }
    
    // 取得快取的圖片
    getImage(src) {
        return this.cache.get(src) || null;
    }
    
    // 建立 SVG 圖片 (程式化生成)
    createSVGImage(svgString, width, height) {
        return new Promise((resolve) => {
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.src = url;
            if (width) img.width = width;
            if (height) img.height = height;
        });
    }
    
    // 清理快取
    clearCache() {
        this.cache.clear();
    }
    
    removeFromCache(src) {
        this.cache.delete(src);
    }
    
    // 取得快取大小
    getCacheSize() {
        return this.cache.size;
    }
}