/*
 * Module to handle push notifications. To subscribe to a notification the following happens:
 *
 * - The vapid key is fetched from the server
 * - The vapid key is passed into the subcribe method to generate a subscription token
 * - The subscription token is then sent to the server.
 *  
 * The server then uses the subscription token to send push notifications to that user. The
 * pushsubscriptionchange event means that the subscription has expired and needs to be 
 * created again.
 */
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

    function onPageSubscriptionChange() {
        dataStore.init().then(() => {
            return dataStore.getUser();
        }).then(subscribe);
    }

    function show(title, body) {
        return self.registration.showNotification(title, {
            body: body
        });
    }

    function padNumber(num) {
        return num >= 0 && num <= 9 ? '0' + num : '' + num;
    }

    function getTimeStr(date) {
        // Format time as HH:mm
        const hours = padNumber(date.getHours());
        const minutes = padNumber(date.getMinutes());
        return hours + ':' + minutes;
    }

    function getReminderText(reminder) {
        const timeStr = getTimeStr(reminder.dateObj);
        return reminder.type + ' ' + timeStr + ' ' + reminder.room;
    }

    function showForReminder(id) {
        dataStore.init().then(() => {
            return dataStore.getReminder(id);
        }).then(reminder => {
            if (reminder != null) {
                const text = getReminderText(reminder);
                show(reminder.title, text);
            } else {
                console.log('Reminder not found for notification with ID: ' + id);
            }
        }).catch(console.log);
    }

    function test(user) {
        return fetch('/api/notifications/test', {
            method: 'post',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user._id }),
        });
    }

    // We check for document as this module can be loaded inside the SW.
    if ('document' in this) {
        app.documentLoaded().then(() => {
            self.addEventListener('pushsubscriptionchange', onPageSubscriptionChange);
        });
    }

    return {
        subscribe: subscribe,
        show: show,
        showForReminder: showForReminder,
        test: test
    }
}());
