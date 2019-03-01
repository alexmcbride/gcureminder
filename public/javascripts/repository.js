/*
 * Module to decide whether to use cached or fresh data
 */
const repository = (function () {
    function fetchJson(url) {
        return fetch(url).then(response => {
            return response.json();
        });
    }

    function getReminders(user) {
        if (navigator.onLine) {
            return fetchJson('/api/reminders/list/' + user.token).then(reminder => {
                return dataStore.setReminders(reminder);
            }).catch(err => {
                console.log('Fetch error (using cache): ' + err);
                return dataStore.getReminders(user._id);
            });
        } else {
            return dataStore.getReminders(user._id);
        }
    }

    function getReminder(user, id) {
        if (navigator.onLine) {
            return fetchJson('/api/reminders/' + user.token + '/' + id).then(reminder => {
                return dataStore.setReminder(reminder);
            }).catch(err => {
                console.log('Fetch error (using cache): ' + err);
                return dataStore.getReminder(id);
            });
        } else {
            return dataStore.getReminder(id);
        }
    }

    function addReminder(token, reminder) {
        return dataStore.setReminder(reminder).then(data => {
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
        return dataStore.editDistance(distance).then(() => {
            return backgroundSync.queue(token, { distance: distance }, '/api/settings/distance');
        });
    }

    function editLocation(token, latitude, longitude) {
        return dataStore.editLocation(latitude, longitude).then(() => {
            return backgroundSync.queue(token, { latitude: latitude, longitude: longitude }, '/api/settings/location');
        });
    }

    function editAtLocation(token, atLocation) {
        return dataStore.getUser().then(user => {
            if (user.atLocation !== atLocation) {
                return dataStore.editAtLocation(atLocation).then(() => {
                    return backgroundSync.queue(token, { atLocation: atLocation }, '/api/settings/at-location');
                });
            } else {
                return Promise.resolve();
            }
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
