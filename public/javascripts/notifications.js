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
        return createSubscription().then(subscription => {
            return registerSubscription(user, subscription);
        }).then(() => {
            user.subscription = true;
            return dataStore.setUser(user).then(() => {
                console.log('Subscribed to push notifications');
            });
        });
    }

    function createSubscription() {
        let convertedPublicKey;
        return fetch('/api/notifications/vapidPublicKey').then(response => {
            return response.text();
        }).then(vapidPublicKey => {
            convertedPublicKey = urlBase64ToUint8Array(vapidPublicKey);
            return navigator.serviceWorker.ready;
        }).then(registration => {
            return registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedPublicKey
            });;
        });
    }

    function registerSubscription(user, subscription) {
        return fetch('/api/notifications/register', {
            method: 'post',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: user.token, subscription: subscription }),
        });
    }

    function reRegisterSubscription(user, subscription) {
        return serviceWorker.pushManager.getSubscription().then(oldSubscription => {
            return fetch('/api/notifications/re-register', {
                method: 'post',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: user.token, subscription: subscription, oldSubscription: oldSubscription }),
            });
        });
    }

    function onPageSubscriptionChange() {
        console.log('Subscription changed');
        return dataStore.getUser().then(user => {
            return createSubscription().then(subscription => {
                return reRegisterSubscription(user, subscription).then(() => {
                    console.log('Re-registered push notification subscription');
                });
            });
        }).catch(console.log);
    }

    function show(event) {
        return self.registration.showNotification('GCU Reminder', {
            body: event.data.text()
        });
    }

    function test(user) {
        return fetch('/api/notifications/test', {
            method: 'post',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user._id }),
        });
    }

    if ('document' in this) {
        util.documentLoaded().then(() => {
            self.addEventListener('pushsubscriptionchange', onPageSubscriptionChange);
        });
    }

    return {
        subscribe: subscribe,
        show: show,
        test: test
    }
}());
