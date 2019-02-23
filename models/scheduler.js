const Agenda = require('agenda');
const ReminderDb = require('./reminder-db');

const scheduler = (function () {
    const db = new ReminderDb();
    let agenda = null;

    async function checkReminders() {
        const minutes = 1;
        const reminders = await db.getPendingReminders(minutes);
        reminders.forEach(async reminder => {
            const user = await db.getUser(reminder.userId);
            if (user.atLocation) {
                console.log('Location push notification for ' + reminder.title);
            } else {
                console.log('Push notification for ' + reminder.title);
            }
            await db.editNotified(reminder, true);
        });
    }

    function start(mongoDb) {
        agenda = new Agenda().mongo(mongoDb, 'jobs');
        agenda.define('check reminders', checkReminders);
        agenda.every('1 minute', 'check reminders');
        agenda.start();
    }

    return {
        start: start
    }
}());

module.exports = scheduler;
