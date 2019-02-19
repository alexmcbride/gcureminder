const CACHE_NAME = 'gcu-reminder-v1';
const URLS_TO_CACHE = [
    '/',
    '/reminder',
    '/settings',

    '/stylesheets/style.css',
    '/stylesheets/bootstrap.min.css',

    '/sw.js',
    '/javascripts/data-store.js',
    '/javascripts/index.js',
    '/javascripts/json.js',
    '/javascripts/repository.js',
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

    '/manifest.json',
    '/images/icons/apple-icon-57x57.png',
    '/images/icons/apple-icon-60x60.png',
    '/images/icons/apple-icon-72x72.png',
    '/images/icons/apple-icon-76x76.png',
    '/images/icons/apple-icon-114x114.png',
    '/images/icons/apple-icon-120x120.png',
    '/images/icons/apple-icon-144x144.png',
    '/images/icons/apple-icon-152x152.png',
    '/images/icons/apple-icon-180x180.png',
    '/images/icons/android-icon-192x192.png',
    '/images/icons/favicon-32x32.png',
    '/images/icons/favicon-96x96.png',
    '/images/icons/favicon-16x16.png',
    '/images/icons/ms-icon-144x144.png'
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
