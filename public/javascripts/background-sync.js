/*
 * Module to handle background sync. Updates are queued in indexed DB. When the sw.js gets a sync 
 * event it calls the sync function. This then reads the requested update from the DB and then
 * posts each one. If successful the item is then dequeued.
 */
const backgroundSync = (function () {
    // Add item to the background sync queue.
    async function queue(token, data, url, message) {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
            console.log('Queueing item: ' + url + ': ' + (performance.timeOrigin + performance.now()));
            await dataStore.addSyncItem(token, data, url, message);
            await registration.sync.register('background-sync');
        } else {
            // Sync not supported so just try to send normally.
            console.log('Syncing item: ' + url);
            await postJsonItem(token, data, url);
        }
    }

    // Attempt to sync all items in the queue. Returns array of synced items.
    async function sync() {
        // When called from Service Worker the database might not have been be initialized.
        await dataStore.init();
        const items = await dataStore.getSyncItems();
        const promises = items.map(async item => {
            const response = await postJsonItem(item.token, item.data, item.url);
            if (response.ok) {
                console.log('Item synced: ' + (performance.timeOrigin + performance.now()));
                await dataStore.deleteSyncItem(item.id);
                return item;
            } else {
                console.log('Error: not OK: ' + (performance.timeOrigin + performance.now()));
                return null;
            }
        });
        const syncedItems = await Promise.all(promises);
        return syncedItems.filter(item => item != null);
    }

    // Send a request to the server.
    function postJsonItem(token, data, url) {
        return fetch(url, {
            method: 'post',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: token,
                data: data
            })
        });
    }

    return {
        queue: queue,
        sync: sync
    }
}());