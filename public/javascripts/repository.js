/*
 * Module to decide whether to use cached or fresh data
 */
const repository = (function () {
    function getReminders(token) {
        return new Promise(async (resolve, reject) => {
            await dataStore.init();
            const reminders = await dataStore.getReminders();
            if (reminders.length == 0) {
                console.log('Getting fresh reminders');
                const reminders = json.getReminders(token);
                await dataStore.addReminders(reminders);
            } else {
                console.log('Using cached reminders');
            }
            resolve(reminders);
        });
    }

    function getReminder(token, id) {
        return new Promise(async (resolve, reject) => {
            await dataStore.init();
            let reminder = await dataStore.getReminder(id);
            if (reminder === undefined) {
                console.log('Getting fresh reminder');
                reminder = await json.getReminder(token, id);
                await dataStore.setReminder(reminder);
            } else {
                console.log('Using cached reminder');
            }
            resolve(reminder);
        });
    }

    function addReminder(token, reminder) {
        return new Promise(async (resolve, reject) => {
            const response = await json.addReminder(token, reminder);
            await dataStore.init();
            await dataStore.setReminder(response.reminder);
            resolve(response);
        });
    }

    function editReminder(token, reminder) {
        return new Promise(async (resolve, reject) => {
            await dataStore.init();
            await dataStore.setReminder(reminder);
            const response = await json.editReminder(token, reminder);
            resolve(response);
        });
    }

    function deleteReminder(token, id) {
        return new Promise(async (resolve, reject) => {
            await dataStore.init();
            await dataStore.deleteReminder(id);
            const response = await json.deleteReminder(token, id);
            resolve(response);
        });
    }

    return {
        getReminders: getReminders,
        getReminder: getReminder,
        editReminder: editReminder,
        addReminder: addReminder,
        deleteReminder: deleteReminder
    }
}());