const CACHE_NAME = 'gcu-reminder-v7';
const URLS_TO_CACHE = [
    '/',
    '/reminder',
    '/settings',

    '/stylesheets/style.css',
    '/stylesheets/bootstrap.min.css',

    '/manifest.json',

    '/javascripts/data-store.js',
    '/javascripts/index.js',
    '/javascripts/repository.js',
    '/javascripts/login.js',
    '/javascripts/reminder.js',
    '/javascripts/settings.js',
    '/javascripts/util.js',
    '/javascripts/location-handler.js',
    '/javascripts/notifications.js',
    '/javascripts/background-sync.js',
    '/javascripts/layout.js',

    '/images/delete-ic.png',
    '/images/edit-ic.png',
    '/images/home-ic.png',
    '/images/settings-ic.png',
    '/images/time-ic.png',
    '/favicon.ico',

    '/images/icons/apple-icon-57x57.png',
    '/images/icons/apple-icon-60x60.png',
    '/images/icons/apple-icon-72x72.png',
    '/images/icons/apple-icon-76x76.png',
    '/images/icons/apple-icon-114x114.png',
    '/images/icons/apple-icon-120x120.png',
    '/images/icons/apple-icon-144x144.png',
    '/images/icons/apple-icon-152x152.png',
    '/images/icons/apple-icon-180x180.png',
    '/images/icons/android-icon-144x144.png',
    '/images/icons/android-icon-192x192.png',
    '/images/icons/favicon-32x32.png',
    '/images/icons/favicon-96x96.png',
    '/images/icons/favicon-16x16.png',
    '/images/icons/ms-icon-144x144.png'
];

self.addEventListener('activate', event => {
    // cause SW to take control of pages in scope immediately
    event.waitUntil(self.clients.claim());
})

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

function sendMessage(message) {
    return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ message: message });
        });
    });
}

function sendMessageToClient(message, clientId) {
    return self.clients.get(clientId).then(client => {
        client.postMessage({ message: message });
    });
}

self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(backgroundSync.sync().then(() => {
            return sendMessage('Queued updates background synced');
        }).catch(console.log));
    }
});

self.addEventListener('push', event => {
    event.waitUntil(notifications.show(event));
});

importScripts('/javascripts/util.js');
importScripts('/javascripts/data-store.js');
importScripts('/javascripts/background-sync.js');
importScripts('/javascripts/notifications.js');