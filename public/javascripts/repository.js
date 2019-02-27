/*
 * Module to decide whether to use cached or fresh data
 */
const repository = (function () {
    function sortRemindersByTime(a, b) {
        const timeA = a.dateObj.getTime();
        const timeB = b.dateObj.getTime();
        if (timeA > timeB) {
            return 1;
        } else if (timeA < timeB) {
            return -1;
        } else {
            return 0;
        }
    }

    async function getReminders(userId, token) {
        let reminders = await dataStore.getReminders(userId);
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
        const data = await dataStore.addReminder(reminder);
        await backgroundSync.queue(token, data, '/api/reminders/add');
    }

    async function editReminder(token, reminder) {
        const data = await dataStore.setReminder(reminder);
        backgroundSync.queue(token, data, '/api/reminders/edit');
    }

    async function deleteReminder(token, id) {
        await dataStore.deleteReminder(id);
        backgroundSync.queue(token, {}, '/api/reminders/delete/' + id);
    }

    async function editDistance(token, distance) {
        await dataStore.editDistance(distance);
        backgroundSync.queue(token, { distance: distance }, '/api/settings/distance');
    }

    async function editLocation(token, latitude, longitude) {
        await dataStore.editLocation(latitude, longitude);
        return backgroundSync.queue(token, { latitude: latitude, longitude: longitude }, '/api/settings/location');
    }

    async function editAtLocation(token, atLocation) {
        dataStore.getUser().then(async user => {
            if (atLocation != user.atLocation) {
                await dataStore.editAtLocation(atLocation);
                return backgroundSync.queue(token, { atLocation: atLocation }, '/api/settings/at-location');
            }
        })
    }

    return {
        getReminders: getReminders,
        getReminder: getReminder,
        editReminder: editReminder,
        addReminder: addReminder,
        deleteReminder: deleteReminder,
        editDistance: editDistance,
        editLocation: editLocation,
        editAtLocation: editAtLocation
    }
}());
