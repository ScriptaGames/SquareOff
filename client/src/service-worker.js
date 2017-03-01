var workerVersion = 'v8'; // increment this ANY TIME you update the service-worker
var cacheName = 'squareoff-' + workerVersion;

this.addEventListener('install', function (event) {
    console.log('WORKER: installing');
    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('WORKER: caching everything');
            return cache.addAll([
                '/',
                'assets/sounds/blockPlace.mp3',
                'assets/sounds/nameType',
                'assets/sounds/goal.mp3',
                'assets/sounds/colorPick.mp3',
                'assets/sounds/bounce.mp3',
                'assets/sounds/nameType.mp3',
                'assets/sounds/play.mp3',
                'assets/images/logo.svg',
                'assets/images/icon-256.png',
                'assets/images/disc-sprite.png',
                'assets/images/logo.png',
                'assets/images/block-sprite.png',
                'assets/images/disc-particle.png',
                'assets/images/icon-192.png',
                'assets/images/hover-sprite.png',
                'assets/images/icon-144.png',
                'assets/images/icon-96.png',
                'assets/images/disc-particle.xcf',
                'js/phaser-tiled.js',
                'scripts/phaser.min.js',
                'scripts/phaser-debug.js',
                'scripts/phaser.map',
                'scripts/game.js.map',
                'scripts/game.js',
                'scripts/phaser.js',
                'styles/main.css',
            ]);
        })
    );
});

this.addEventListener('activate', function (event) {
    console.log('WORKER: activating');
    var cacheWhitelist = [cacheName];

    event.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    console.log(`WORKER: deleting expired cache "${key}"`);
                    return caches.delete(key);
                }
            }));
        })
    );
});

this.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(resp) {
            return resp || fetch(event.request).then(function(response) {
                return caches.open(cacheName).then(function(cache) {
                    if (event.request.method === 'GET' && event.request.url === location.origin+'/') {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                });
            }).catch(function (err) { console.error(err) });
        })
    );
});
