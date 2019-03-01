const layout = (function() {
    util.documentLoaded().then(()=>{
        document.getElementById('test-notifications').addEventListener('click', event => {
            dataStore.init().then(() => {
                return dataStore.getUser();
            }).then(notifications.test);
        });
    
        // todo: this probably shouldn't be here.
        document.getElementById('check-reminders').addEventListener('click', event => {
            fetch('/api/notifications/check-reminders').then(() => {
                console.log('Request check reminders');
            });
        });
    });
}());