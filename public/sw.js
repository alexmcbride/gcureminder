var CACHE_NAME = 'gcu-reminder-v1';
var urlsToCache = [
    '/',
    '/reminder',
    '/settings',

    '/stylesheets/style.css',
    '/stylesheets/bootstrap.min.css',

    '/javascripts/data-store.js',
    '/javascripts/index.js',
    '/javascripts/json.js',
    '/javascripts/login.js',
    '/javascripts/reminder.js',
    '/javascripts/settings.js',
    '/javascripts/util.js',

    '/images/delete-ic.png',
    '/images/edit-ic.png',
    '/images/home-ic.png',
    '/images/settings-ic.png',
    '/images/time-ic.png',
];

self.addEventListener('install', event => {
    // Perform install steps
    console.log('SW installed, storing cache');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    console.log('Fetch: ' + event.request);
    event.respondWith(
        caches.match(event.request).then(response => {
            // Cache hit - return response
            if (response) {
                console.log('Cache hit: ' + event.request);
                return response;
            } else {
                return fetch(event.request);
            }
        }).catch(console.log)
    );
});
