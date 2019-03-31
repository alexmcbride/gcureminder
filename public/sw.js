const CACHE_VERSION = 10;
const CACHE_PREFIX = 'gcu-reminder-v';
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;

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
    '/javascripts/app.js',
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
];

// When activated cause SW to take control of pages in scope immediately
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
    event.waitUntil(removeOldCaches());
})

// Remove old caches on upgrade
function removeOldCaches() {
    const previousCache = CACHE_PREFIX + (CACHE_VERSION - 1);
    return caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => {
            // Not equal to this or previous version.
            if (cacheName !== CACHE_NAME && cacheName !== previousCache) {
                return caches.delete(cacheName);
            }
        }));
    });
}

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
            const messages = syncedItems.map(item => item.message);
            const message = getSyncMessage(messages);
            return sendMessageToAll(message);
        }).catch(err => {
            console.log('Error: fetch failed @ ' + (performance.timeOrigin + performance.now()));
        }));
    }
});

// Handle push notification.
self.addEventListener('push', event => {
    console.log("Push received: " + (performance.timeOrigin + performance.now()));
    const data = event.data.json();
    event.waitUntil(notifications.show(data.title, data.text));
});

importScripts('/javascripts/data-store.js');
importScripts('/javascripts/background-sync.js');
importScripts('/javascripts/notifications.js');