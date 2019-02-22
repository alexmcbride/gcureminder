/*
 * Module to decide whether to use cached or fresh data
 */
const repository = (function () {
    function sortRemindersByTime(a, b) {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        if (timeA > timeB) {
            return 1;
        } else if (timeA < timeB) {
            return -1;
        } else {
            return 0;
        }
    }

    async function getReminders(token) {
        await dataStore.init();
        let reminders = await dataStore.getReminders();
        if (reminders.length == 0 && navigator.onLine) {
            console.log('Getting fresh reminders');
            reminders = await util.fetchJson('/api/reminders/list/' + token);
            await dataStore.addReminders(reminders);
        } else {
            console.log('Using cached reminders');
            reminders.sort(sortRemindersByTime);
        }
        return reminders;
    }

    async function getReminder(token, id) {
        await dataStore.init();
        let reminder = await dataStore.getReminder(id);
        if (reminder === undefined && navigator.onLine) {
            console.log('Getting fresh reminder');
            reminder = await util.fetchJson('/api/reminders/' + token + '/' + id);
            await dataStore.setReminder(reminder);
        } else {
            console.log('Using cached reminder');
        }
        return reminder;
    }

    async function addReminder(token, reminder) {
        const data = await dataStore.createReminder(reminder);
        await queueSyncItem(token, data, '/api/reminders/add');
    }

    async function editReminder(token, reminder) {
        const data = await dataStore.setReminder(reminder);
        queueSyncItem(token, data, '/api/reminders/edit');
    }

    async function deleteReminder(token, id) {
        await dataStore.deleteReminder(id);
        queueSyncItem(token, {}, '/api/reminders/delete/' + id);
    }

    async function editDistance(token, distance) {
        await dataStore.editDistance(distance);
        queueSyncItem(token, { distance: distance }, '/api/settings/distance');
    }

    async function editLocation(token, latitude, longitude) {
        await dataStore.editLocation(latitude, longitude);
        return queueSyncItem(token, { latitude: latitude, longitude: longitude }, '/api/settings/location');
    }

    async function editAtLocation(token, atLocation) {
        dataStore.getUser().then(async user => {
            if (atLocation != user.atLocation) {
                await dataStore.editAtLocation(atLocation);
                return queueSyncItem(token, { atLocation: atLocation }, '/api/settings/at-location');
            }
        }) 
    }

    async function queueSyncItem(token, data, url) {
        await dataStore.addSyncItem(token, data, url);
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
    }

    async function syncQueuedItems() {
        await dataStore.init();
        const items = await dataStore.getSyncItems();
        items.forEach(async item => {
            console.log('Background syncing item: ' + item.url);
        
            const response = await util.postJson(item.url, {
                token: item.token,
                data: item.data
            });
    
            if (response.success) {
                await dataStore.deleteSyncItem(item.id);
                console.log('Background item synced');
            } else {
                console.log('Error: ' + response.error);
            }
        });
    }

    return {
        getReminders: getReminders,
        getReminder: getReminder,
        editReminder: editReminder,
        addReminder: addReminder,
        deleteReminder: deleteReminder,
        syncQueuedItems: syncQueuedItems,
        editDistance: editDistance,
        editLocation: editLocation,
        editAtLocation: editAtLocation
    }
}());
