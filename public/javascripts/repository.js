/*
 * Module to decide whether to use cached or fresh data
 */
const repository = (function () {
    function getReminders(token) {
        return new Promise(async (resolve, reject) => {
            await dataStore.init();
            const reminders = await dataStore.getReminders();
            if (reminders.length > 0) {
                console.log('Using cached reminders');
                resolve(reminders);
            } else {
                console.log('Getting fresh reminders');
                const reminders = json.getReminders(token);
                await dataStore.addReminders(reminders)
                resolve(reminders);
            }
        });
    }

    function deleteReminder(token, id) {
        return new Promise(async (resolve, reject) => {
            await dataStore.init();
            await dataStore.deleteReminder(id);
            const data = await json.deleteReminder(token, id);
            resolve(data);
        });
    }

    return {
        getReminders: getReminders,
        deleteReminder: deleteReminder
    }
}());