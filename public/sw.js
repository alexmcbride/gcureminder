const CACHE_NAME = 'gcu-reminder-v7';
const URLS_TO_CACHE = [
    // Pages
    '/',
    '/reminder',
    '/settings',

    // Styles
    '/stylesheets/style.css',
    '/stylesheets/bootstrap.min.css',

    // Json
    '/manifest.json',

    // Js
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

    // Images
    '/images/delete-ic.png',
    '/images/edit-ic.png',
    '/images/home-ic.png',
    '/images/settings-ic.png',
    '/images/time-ic.png',
    '/favicon.ico',

    // Device icons...
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

// When activated cause SW to take control of pages in scope immediately
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
})

// When installed cache pages.
self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(URLS_TO_CACHE);
    }));
});

// When fetching try and fetch local cache, otherwise fetch remote
self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request).then(response => {
        return response || fetch(event.request);
    }));
});

// Send message to all browser windows using this service worker.
function sendMessageToAll(message) {
    return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ message: message });
        });
    });
}

// Send message to only single browser window.
function sendMessageToClient(message, clientId) {
    return self.clients.get(clientId).then(client => {
        client.postMessage({ message: message });
    });
}

// Get single message, or generic message if more than one.
function getSyncMessage(messages) {
    if (messages.length > 1) {
        return 'Updates synced with server';
    } else if (messages.length === 1) {
        return messages[0];
    } else {
        return 'No message';
    }
}

// Handle sync event.
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        // Process background sync and send sync message to be displayed in browser.
        event.waitUntil(backgroundSync.sync().then(syncedItems => {
            const messages = syncedItems.filter(item => item != null).map(item => item.message);
            const message = getSyncMessage(messages);
            return sendMessageToAll(message);
        }).catch(console.log));
    }
});

// Handle push notification.
self.addEventListener('push', event => {
    const data = event.data.json();
    event.waitUntil(notifications.show(data.title, data.text));
});

importScripts('/javascripts/util.js');
importScripts('/javascripts/data-store.js');
importScripts('/javascripts/background-sync.js');
importScripts('/javascripts/notifications.js');