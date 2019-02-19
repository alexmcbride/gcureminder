/*
 * Module to decide whether to use cached or fresh data
 */
const repository = (function () {
    function getReminders(token) {
        return new Promise(async (resolve, reject) => {
            await dataStore.init();
            const reminders = await dataStore.getReminders();
            if (reminders.length == 0) {
                console.log('Getting fresh reminders');
                const reminders = json.getReminders(token);
                await dataStore.addReminders(reminders);
            } else {
                console.log('Using cached reminders');
            }
            resolve(reminders);
        });
    }

    function getReminder(token, id) {
        return new Promise(async (resolve, reject) => {
            await dataStore.init();
            let reminder = await dataStore.getReminder(id);
            if (reminder === undefined) {
                console.log('Getting fresh reminder');
                reminder = await json.getReminder(token, id);
                await dataStore.setReminder(reminder);
            } else {
                console.log('Using cached reminder');
            }
            resolve(reminder);
        });
    }

    function addReminder(token, reminder) {
        return new Promise(async (resolve, reject) => {
            await dataStore.addPendingReminder(token, reminder);
            navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('add-reminder').then(event => {
                    console.log('Async add-reminder registered');
                }).catch(error => {
                    console.log('Error: ' + error);
                });
            });
            resolve();
        });
    }

    function editReminder(token, reminder) {
        return new Promise(async (resolve, reject) => {
            await dataStore.init();
            await dataStore.setReminder(reminder);
            const response = await json.editReminder(token, reminder);
            resolve(response);
        });
    }

    function deleteReminder(token, id) {
        return new Promise(async (resolve, reject) => {
            await dataStore.init();
            await dataStore.deleteReminder(id);
            const response = await json.deleteReminder(token, id);
            resolve(response);
        });
    }
    
    async function addReminderSync() {
        const pendingReminders = await dataStore.getPendingReminders();
        pendingReminders.forEach(async data => {
            console.log('handling pending reminder');
            const result = await json.addReminder(data.token, data.reminder);
            await dataStore.setReminder(result.reminder);
            await dataStore.deletePendingReminder(data.id);
        });
    }

    navigator.serviceWorker.addEventListener('sync', event => {
        console.log('sync');
        if (event.tag === 'add-reminder') {
            event.waitUntil(addReminderSync());
        }
    });

    return {
        getReminders: getReminders,
        getReminder: getReminder,
        editReminder: editReminder,
        addReminder: addReminder,
        deleteReminder: deleteReminder
    }
}());