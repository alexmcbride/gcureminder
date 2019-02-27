const backgroundSync = (function () {
    function queue(token, data, url) {
        return navigator.serviceWorker.ready.then(registration => {
            if ('sync' in registration) {
                // set notification on page saying background sync in use
                console.log('Background syncing item: ' + url);
                return dataStore.addSyncItem(token, data, url).then(() => {
                    return registration.sync.register('background-sync');
                });
            } else {
                console.log('Syncing item: ' + url);
                return postJsonItem(token, data, url);
            }
        });
    }

    function sync() {
        return dataStore.init().then(() => {
            return dataStore.getSyncItems();
        }).then(items => {
            const promises = items.map(item => {
                return postJsonItem(item.token, item.data, item.url).then(response => {
                    if (response.success) {
                        return dataStore.deleteSyncItem(item.id);
                    } else {
                        throw 'Error: ' + response.error;
                    }
                });
            })
            return Promise.all(promises);
        });
    }

    function postJsonItem(token, data, url) {
        return util.postJson(url, {
            token: token,
            data: data
        });
    }

    return {
        queue: queue,
        sync: sync
    }
}());