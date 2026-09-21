const CACHE_NAME = 'qiedong-game-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/main.css',
    './css/scenes.css',
    './css/animations.css',
    './js/main.js',
    './js/data/dialogs.js',
    './js/systems/GameEngine.js',
    './js/systems/AudioSystem.js',
    './js/systems/StateManager.js',
    './js/systems/InputManager.js',
    './js/utils/AssetLoader.js',
    './js/utils/TTS.js',
    './js/utils/DialogSystem.js',
    './js/utils/ModalSystem.js',
    './js/utils/ToastSystem.js',
    './js/scenes/Scene.js',
    './js/scenes/IntroScene.js',
    './js/scenes/MenuScene.js',
    './js/scenes/Level1Scene.js',
    './js/scenes/Level2Scene.js',
    './js/scenes/Level3Scene.js',
    './js/scenes/Level4Scene.js',
    './js/scenes/Level5Scene.js',
    './js/scenes/EndingScene.js',
    './js/scenes/ParentScene.js',
    './assets/images/favicon.svg',
    './assets/images/icon-192.svg',
    './assets/images/icon-512.svg',
    './assets/images/bg/intro-school.svg',
    './assets/images/bg/menu-school.svg',
    './assets/images/bg/level1-road.svg',
    './assets/images/bg/level2-bus-stop.svg',
    './assets/images/bg/level3-bus.svg',
    './assets/images/bg/level4-bus-inside.svg',
    './assets/images/bg/level5-bus-arrival.svg',
    './assets/images/bg/ending-school.svg',
    './assets/images/bg/parent-learning.svg',
    './assets/images/objects/car.svg',
    './assets/images/objects/bus-stop-safe.svg',
    './assets/images/objects/bus-stop-danger1.svg',
    './assets/images/objects/bus-stop-danger2.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            }).catch(() => {
                return caches.match('./index.html');
            });
        })
    );
});
