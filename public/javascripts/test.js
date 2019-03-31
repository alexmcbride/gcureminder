const layout = (function () {
    util.documentLoaded().then(() => {
        document.getElementById('test-notifications').addEventListener('click', event => {
            dataStore.init().then(() => {
                return dataStore.getUser();
            }).then(user => {
                return notifications.test(user);
            }).then(() => {
                console.log("Push sent: " + (performance.timeOrigin + performance.now()));
            }).catch(err => {
                console.log(err);
                console.log("push error: " + (performance.timeOrigin + performance.now()));
            });
        });

        document.getElementById('check-reminders').addEventListener('click', event => {
            fetch('/api/reminders/check').then(() => {
                console.log('Request check reminders');
            });
        });
    });
}());