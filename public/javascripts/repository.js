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

    function editDistance(token, distance) {
        return queueSyncItem(token, { distance: distance }, 'edit-distance');
    }

    function editLocation(token, latitude, longitude) {
        return queueSyncItem(token, { latitude: latitude, longitude: longitude }, 'edit-location');
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
        items.forEach(syncQueuedItem);
    }

    async function syncQueuedItem(item) {
        console.log('Background sync: ' + item.tag);
        const syncFunction = getSyncFunction(item.tag);
        if (syncFunction == null) {
            console.log('Sync function not found');
        } else {
            const response = await syncFunction(item);
            if (response.success) {
                await dataStore.deleteSyncItem(item.id);
            } else {
                console.log('Error: ' + response.error.message);
            }
        }
    }

    function getSyncFunction(tag) {
        if (tag == 'add-reminder') {
            return syncAddReminder;
        } else if (tag == 'edit-reminder') {
            return syncEditReminder;
        } else if (tag == 'delete-reminder') {
            return syncDeleteReminder;
        } else if (tag == 'edit-distance') {
            return syncEditDistance;
        } else if (tag == 'edit-location') {
            return syncEditLocation;
        }
        return null;
    }

    async function syncAddReminder(item) {
        const response = await json.addReminder(item.token, item.data);
        await dataStore.setReminder(response.reminder);
        return response;
    }

    async function syncEditReminder(item) {
        const response = await json.editReminder(item.token, item.data);
        await dataStore.setReminder(response.reminder);
        return response;
    }

    async function syncDeleteReminder(item) {
        const response = await json.deleteReminder(item.token, item.data.id);
        await dataStore.deleteReminder(item.data.id);
        return response;
    }

    async function syncEditDistance(item) {
        const response = await json.editDistance(item.token, item.data.distance);
        await dataStore.editDistance(item.data.distance);
        return response;
    }

    async function syncEditLocation(item) {
        const response = await json.editLocation(item.token, item.data.latitude, item.data.longitude);
        await dataStore.editLocation(item.data.latitude, item.data.longitude);
        return response;
    }

    return {
        getReminders: getReminders,
        getReminder: getReminder,
        editReminder: editReminder,
        addReminder: addReminder,
        deleteReminder: deleteReminder,
        syncQueuedItems: syncQueuedItems,
        editDistance: editDistance,
        editLocation: editLocation
    }
}());

