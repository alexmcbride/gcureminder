const Agenda = require('agenda');
const ReminderDb = require('./reminder-db');
const notifications = require('./notifications');


const scheduler = (function () {
    const db = new ReminderDb();
    let agenda = null;

    function padNumber(num) {
        return num >= 0 && num <= 9 ? '0' + num : '' + num;
    }

    function getTime(date) {
        const hours = padNumber(date.getHours());
        const minutes = padNumber(date.getMinutes());
        return hours + ":" + minutes;
    }

    function send(token, reminder) {
        const text = reminder.title +
            ' (' + reminder.type + ') at ' + getTime(reminder.date) + ' in ' + reminder.room;
        console.log(text);
        return notifications.send(token, text);
    }

    function shortNotificationDue(user, reminder) {
        if (reminder.shortNotification) {
            return true; // already sent
        } else if (user.atLocation) {
            // todo: fix this
            const oneMinute = 60 * 1000;
            const now = new Date();
            const difference = reminder.date.getTime() - now.getTime();
            return difference > oneMinute;
        } else {
            return false; // not needed
        }
    }

    function longNotificationDue(reminder) {
        return !reminder.longNotification;
    }

    async function checkReminders() {
        console.log('Checking reminders');
        const reminders = await db.getPendingReminders();
        reminders.forEach(async reminder => {
            const user = await db.getUserFromId(reminder.userId);
            if (shortNotificationDue(user, reminder)) {
                await send(user.token, reminder);
                await db.editShortNotification(reminder, true);
            } else if (longNotificationDue(reminder)) {
                await send(user.token, reminder);
                await db.editLongNotification(reminder, true);
            }
        });
    }

    function start(mongoDb) {
        agenda = new Agenda().mongo(mongoDb, 'jobs');
        agenda.define('check reminders', checkReminders);
        agenda.every('1 minute', 'check reminders');
        agenda.start();
    }

    return {
        start: start,
        checkReminders: checkReminders
    }
}());

module.exports = scheduler;
