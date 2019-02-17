const CACHE_NAME = 'gcu-reminder-v1';
const URLS_TO_CACHE = [
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
    '/favicon.ico',
    '/sw.js'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(URLS_TO_CACHE);
    }));
});

self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request).then(response => {
        return response || fetch(event.request);
    }));
});
