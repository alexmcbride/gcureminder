const notifications = (function () {
    // This function is needed because Chrome doesn't accept a base64 encoded string
    // as value for applicationServerKey in pushManager.subscribe yet
    // https://bugs.chromium.org/p/chromium/issues/detail?id=802280
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    function subscribe(user) {
        return fetch('/api/notifications/vapidPublicKey').then(response => {
            return response.text();
        }).then(vapidPublicKey => {
            const convertedPublicKey = urlBase64ToUint8Array(vapidPublicKey);
            return navigator.serviceWorker.ready.then(registration => {
                return registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedPublicKey
                });
            }).then(subscription => {
                return util.createJson('/api/notifications/register', { token: user.token, subscription: subscription })
            });
        })
    }

    function show(event) {
        return self.registration.showNotification('GCU Reminder', {
            body: event.data.text()
        });
    }

    function test(user, payload) {
        return util.createJson('/api/notifications/test', { token: user.token, payload: payload });
    }

    if ('document' in this) {
        util.documentLoaded().then(() => {
            document.getElementById('test-notifications').addEventListener('click', event => {
                dataStore.init().then(() => {
                    return dataStore.getUser();
                }).then(user => {
                    return test(user, 'This is a test!');
                });
            });
        });
    }

    return {
        subscribe: subscribe,
        show: show,
        test: test
    }
}());
