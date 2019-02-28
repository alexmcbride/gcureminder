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

    function getRemindersCached(userId) {
        return dataStore.getReminders(userId).then(reminders => {
            reminders.sort(sortRemindersByTime);
            return Promise.resolve(reminders);
        });
    }

    function getRemindersFresh(token) {
        return util.fetchJson('/api/reminders/list/' + token).then(reminders => {
            if (reminders !== undefined) {
                return dataStore.setReminders(reminders);
            } else {
                return Promise.resolve(null);
            }
        });
    }

    function getReminderCached(id) {
        return dataStore.getReminder(id);
    }

    function getReminderFresh(token, id) {
        return util.fetchJson('/api/reminders/' + token + '/' + id).then(reminder => {
            if (reminder !== undefined) {
                return dataStore.setReminder(reminder);
            } else {
                return Promise.resolve(null);
            }
        });
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
        getRemindersCached: getRemindersCached,
        getRemindersFresh: getRemindersFresh,
        getReminderCached: getReminderCached,
        getReminderFresh: getReminderFresh,
        editReminder: editReminder,
        addReminder: addReminder,
        deleteReminder: deleteReminder,
        editDistance: editDistance,
        editLocation: editLocation,
        editAtLocation: editAtLocation
    }
}());
