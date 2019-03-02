/*
 * Module to handle background sync. Updated are queued in indexed DB. When the sw.js gets a sync 
 * event it calls the sync function. This then reads the requested update from the DB and then
 * posts each one. If successful the item is then dequeued.
 */
const backgroundSync = (function () {
    function getFutureTime(minutes) {
        return new Date(new Date().getTime() + (minutes * 1000));
    }

    // Add item to the background sync queue.
    async function queue(token, data, url) {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
            console.log('Background queueing item: ' + url);
            await dataStore.addSyncItem(token, data, url);
            await registration.sync.register('background-sync');
        } else {
            // Sync not supported so just try to send normally.
            console.log('Syncing item: ' + url);
            await postJsonItem(token, data, url);
        }
    }

    // Attempt to sync all items in the queue.
    async function sync() {
        await dataStore.init(); // SW will need the DB initialized.
        const items = await dataStore.getSyncItems();
        const promises = items.map(async item => {
            const response = await postJsonItem(item.token, item.data, item.url);
            const result = await response.json();
            if (result.success) {
                await dataStore.deleteSyncItem(item.id);
            } else {
                throw 'Error: ' + response.error;
            }
            return item;
        })
        await Promise.all(promises);
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