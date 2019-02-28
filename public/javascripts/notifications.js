const notifications = (function () {
    function createJson(url, data) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'post',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then(response => {
                if (response.status === 201) {
                    resolve(response);
                } else {
                    reject('Status ' + response.status);
                }
            }).catch(console.log);
        });
    }

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
                return createJson('/api/notifications/register', { token: user.token, subscription: subscription })
            }).then(async () => {
                user.subscription = true;
                await dataStore.setUser(user);
                console.log('Subscribed to push notifications');
            });
        })
    }

    function show(event) {
        return showLocal(event.data.text());
    }

    function showLocal(body) {
        return self.registration.showNotification('GCU Reminder', {
            body: body
        });
    }

    function test(user) {
        return createJson('/api/notifications/test', { token: user.token });
    }

    // Hook up button if running in a web document.
    // todo: these should be somewhere else
    if ('document' in this) {
        util.documentLoaded().then(() => {
            document.getElementById('test-notifications').addEventListener('click', event => {
                dataStore.init().then(() => {
                    return dataStore.getUser();
                }).then(test);
            });

            document.getElementById('check-reminders').addEventListener('click', event => {
                fetch('/api/notifications/check-reminders').then(() => {
                    console.log('Request check reminders');
                });
            });
        });
    }

    return {
        subscribe: subscribe,
        show: show,
        showLocal: showLocal,
        test: test
    }
}());
