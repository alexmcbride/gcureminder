/*
 * Module to wrap fetch api
 */
const json = (function () {
    function fetchJson(url) {
        return new Promise((resolve, reject) => {
            return fetch(url).then(response => {
                if (response.status === 200) {
                    response.json().then(resolve);
                } else {
                    reject('Status ' + response.status);
                }
            });
        });
    }

    function postJson(url, data) {
        const options = {
            method: 'post',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };
        return new Promise((resolve, reject) => {
            fetch(url, options).then(response => {
                if (response.status === 200) {
                    response.json().then(resolve);
                } else {
                    reject('Status ' + response.status);
                }
            }).catch(reject);
        });
    }

    function getReminders(token) {
        return fetchJson('/api/reminders/list/' + token);
    }

    function getReminder(token, id) {
        return fetchJson('/api/reminders/' + token + '/' + id);
    }

    function addReminder(token, reminder) {
        return postJson('/api/reminders/add', { token: token, reminder: reminder });
    }

    function editReminder(token, reminder) {
        return postJson('/api/reminders/edit', { token: token, reminder: reminder });
    }

    function deleteReminder(token, id) {
        return postJson('/api/reminders/delete/' + id, { token: token });
    }

    function updateDistance(token, distance) {
        return postJson('api/settings/distance', { token: token, distance: distance });
    }

    function updateLocation(token, latitude, longitude) {
        return postJson('api/settings/location', { token: token, latitude: latitude, longitude: longitude });
    }

    return {
        postJson: postJson,
        getReminders: getReminders,
        getReminder: getReminder,
        addReminder: addReminder,
        editReminder: editReminder,
        deleteReminder: deleteReminder,
        updateDistance: updateDistance,
        updateLocation: updateLocation
    };
}());