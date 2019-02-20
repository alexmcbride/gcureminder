/*
 * Module to decide whether to use cached or fresh data
 */
const repository = (function () {
    async function getReminders(token) {
        await dataStore.init();
        let reminders = await dataStore.getReminders();
        if (reminders.length == 0) {
            console.log('Getting fresh reminders');
            reminders = await json.getReminders(token);
            await dataStore.addReminders(reminders);
        } else {
            console.log('Using cached reminders');
        }
        return reminders;
    }

    async function getReminder(token, id) {
        await dataStore.init();
        let reminder = await dataStore.getReminder(id);
        if (reminder === undefined) {
            console.log('Getting fresh reminder');
            reminder = await json.getReminder(token, id);
            await dataStore.setReminder(reminder);
        } else {
            console.log('Using cached reminder');
        }
        return reminder;
    }

    function addReminder(token, reminder) {
        return queueSyncItem(token, reminder, 'add-reminder');
    }

    function editReminder(token, reminder) {
        return queueSyncItem(token, reminder, 'edit-reminder');
    }

    function deleteReminder(token, id) {
        return queueSyncItem(token, { id: id }, 'delete-reminder');
    }

    async function queueSyncItem(token, data, tag) {
        await dataStore.init();
        await dataStore.addSyncItem(token, data, tag);
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
        console.log('Background async registered: ' + tag);
    }

    async function syncQueuedItems() {
        await dataStore.init();
        const items = await dataStore.getSyncItems();
        items.forEach(async item => {
            console.log('Handling background sync: ' + item.tag);
            await syncItem(item);
            await dataStore.deleteSyncItem(item.id);
        });
    }

    async function syncItem(item) {
        if (item.tag == 'add-reminder') {
            const response = await json.addReminder(item.token, item.data);
            await dataStore.setReminder(response.reminder);
        } else if (item.tag == 'edit-reminder') {
            const response = await json.editReminder(item.token, item.data);
            await dataStore.setReminder(response.reminder);
        } else if (item.tag == 'delete-reminder') {
            const response = await json.deleteReminder(item.token, item.data.id);
            await dataStore.deleteReminder(item.data.id);
        }
    }

    return {
        getReminders: getReminders,
        getReminder: getReminder,
        editReminder: editReminder,
        addReminder: addReminder,
        deleteReminder: deleteReminder,
        syncQueuedItems: syncQueuedItems
    }
}());
