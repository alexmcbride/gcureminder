const layout = (function () {
    util.documentLoaded().then(() => {
        document.getElementById('test-notifications').addEventListener('click', event => {
            dataStore.init().then(() => {
                return dataStore.getUser();
            }).then(notifications.test);
        });

        document.getElementById('check-reminders').addEventListener('click', event => {
            fetch('/api/reminders/check').then(() => {
                console.log('Request check reminders');
            });
        });

        navigator.serviceWorker.addEventListener('message', event => {
            console.log('SW message: ' + event.data.message);
            util.showMessage(event.data.message);
        });
    });
}());