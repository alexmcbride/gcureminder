/*
 * Module to decide whether to use cached or fresh data
 */
const repository = (function () {
    function getReminders(user) {
        return fetch('/api/reminders/list/' + user.token).then(response => {
            return response.json().then(reminders => {
                return dataStore.setReminders(reminders);
            });
        }).catch(err => {
            console.log('Fetch error: ' + err);
            return dataStore.getReminders(user._id);
        });
    }

    function getReminder(user, id) {
        return fetch('/api/reminders/' + user.token + '/' + id).then(response => {
            return response.json().then(reminder => {
                return dataStore.setReminder(reminder);
            });
        }).catch(err => {
            console.log('Fetch error: ' + err);
            return dataStore.getReminder(id);
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
