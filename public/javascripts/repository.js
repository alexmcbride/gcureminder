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

    return {
        getReminders: getReminders
    }
}());