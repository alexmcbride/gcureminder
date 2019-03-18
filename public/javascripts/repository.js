/*
 * Module to decide whether to use cached or fresh data. For GET requests it tries to fetch
 * the response and if that fails falls back onto cached data. All POST requests and passed
 * on to the background-sync function, that syncs them when the network is available.
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

    function getReminderData(reminder) {
        return {
            id: reminder.id,
            title: reminder.title,
            type: reminder.type,
            room: reminder.room,
            date: reminder.date,
            duration: reminder.duration
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
        return dataStore.setReminder(reminder).then(document => {
            return backgroundSync.queue(token, getReminderData(document), '/api/reminders/add', 'Add reminder synced');
        });
    }

    function addReminders(reminders) {
        return Promise.all(reminders.map(dataStore.setReminder));
    }

    function editReminder(token, reminder) {
        return dataStore.setReminder(reminder).then(document => {
            return backgroundSync.queue(token, getReminderData(document), '/api/reminders/edit', 'Edit reminder synced');
        });
    }

    function deleteReminder(token, id) {
        return dataStore.deleteReminder(id).then(() => {
            return backgroundSync.queue(token, {}, '/api/reminders/delete/' + id, 'Delete reminder synced');
        });
    }

    function editDistance(token, distance) {
        return dataStore.editDistance(distance).then(() => {
            return backgroundSync.queue(token, { distance: distance }, '/api/settings/distance', 'Edit distance synced');
        });
    }

    function editLocation(token, latitude, longitude) {
        return dataStore.editLocation(latitude, longitude).then(() => {
            return backgroundSync.queue(token, { latitude: latitude, longitude: longitude }, '/api/settings/location', 'Edit location synced');
        });
    }

    function editAtLocation(token, atLocation) {
        return dataStore.editAtLocation(atLocation).then(() => {
            return backgroundSync.queue(token, { atLocation: atLocation }, '/api/settings/at-location', 'Location synced');
        });
    }

    return {
        getReminders: getReminders,
        getReminder: getReminder,
        editReminder: editReminder,
        addReminder: addReminder,
        addReminders: addReminders,
        deleteReminder: deleteReminder,
        editDistance: editDistance,
        editLocation: editLocation,
        editAtLocation: editAtLocation
    }
}());

