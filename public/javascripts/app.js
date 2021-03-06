/*
 * Module with some utility functions.
 */
const app = (function () {
    /* 
     * Called on each page to start the website, initializes the service worker, initializes the database, and then 
     * subscribes to push notifications.
     */
    function start() {
        return documentLoaded()
            .then(initServiceWorker)
            .then(dataStore.init)
            .then(notificationsInit)
            .catch(console.log);
    }

    function initServiceWorker() {
        return new Promise((resolve, reject) => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').then(resolve).catch(reject);
            } else {
                reject('Service worker not supported');
            }
        });
    }

    function documentLoaded() {
        return new Promise((resolve, reject) => {
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", resolve);
            } else {
                resolve();
            }
        });
    }

    function notificationsInit() {
        return dataStore.getUser().then(user => {
            if (user != null && !user.subscription) {
                notifications.subscribe(user);
            }

            // Message sent from service worker.
            navigator.serviceWorker.addEventListener('message', event => {
                console.log('SW message: ' + event.data.message);
                app.showMessage(event.data.message);
            });
        });
    }

    function showMessage(message) {
        const el = document.getElementById('message');
        el.innerHTML = '<div class="alert alert-success">' + message + '</div>';
        el.style.display = 'block';
    };

    function hideMessage() {
        const el = document.getElementById('message');
        el.style.display = 'none';
    }

    function padNumber(num) {
        return num >= 0 && num <= 9 ? '0' + num : '' + num;
    }

    function formatDate(dateStr) {
        // Format date as: yyyy-MM-ddThh:mm
        const date = new Date(dateStr);
        const month = padNumber(date.getMonth() + 1);
        const day = padNumber(date.getDate());
        const hours = padNumber(date.getHours());
        const minutes = padNumber(date.getMinutes());
        return date.getFullYear() + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
    }


    return {
        start: start,
        documentLoaded: documentLoaded,
        showMessage: showMessage,
        hideMessage: hideMessage,
        formatDate: formatDate,
        padNumber: padNumber
    }
}());