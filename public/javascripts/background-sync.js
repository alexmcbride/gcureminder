const backgroundSync = (function () {
    async function queue(token, data, url) {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
            // set notification on page saying background sync in use
            console.log('Background syncing item: ' + url);
            await dataStore.addSyncItem(token, data, url);
            await registration.sync.register('background-sync');
        } else {
            console.log('Syncing item: ' + url);
            await postJsonItem(token, data, url);
        }
    }

    async function sync() {
        await dataStore.init();
        const items = await dataStore.getSyncItems();
        const promises = items.map(async item => {
            const response = await postJsonItem(item.token, item.data, item.url);
            const result = await response.json();
            if (result.success) {
                await dataStore.deleteSyncItem(item.id);
            } else {
                throw 'Error: ' + response.error;
            }
        })
        await Promise.all(promises);
    }

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

    // if ('document' in this) {
    //     util.documentLoaded().then(() => {
    //         navigator.serviceWorker.addEventListener('message', event => {
    //             console.log('Message from SW: ' + event.data.message);
    //         });
    //     });
    // }

    return {
        queue: queue,
        sync: sync
    }
}());