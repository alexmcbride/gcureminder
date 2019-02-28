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

    function addReminder(token, reminder) {
        return dataStore.addReminder(reminder).then(data => {
            return backgroundSync.queue(token, data, '/api/reminders/add');
        });
    }

    function editReminder(token, reminder) {
        return dataStore.setReminder(reminder).then(data => {
            return backgroundSync.queue(token, data, '/api/reminders/edit');
        });
    }

    function deleteReminder(token, id) {
        return dataStore.deleteReminder(id).then(() => {
            return backgroundSync.queue(token, {}, '/api/reminders/delete/' + id);
        });
    }

    function editDistance(token, distance) {
        dataStore.editDistance(distance).then(() => {
            return backgroundSync.queue(token, { distance: distance }, '/api/settings/distance');
        });
    }

    function editLocation(token, latitude, longitude) {
        return dataStore.editLocation(latitude, longitude).then(() => {
            return backgroundSync.queue(token, { latitude: latitude, longitude: longitude }, '/api/settings/location');
        });
    }

    function editAtLocation(token, atLocation) {
        return dataStore.editAtLocation(atLocation).then(() => {
            return backgroundSync.queue(token, { atLocation: atLocation }, '/api/settings/at-location');
        });
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
