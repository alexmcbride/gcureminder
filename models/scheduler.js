const Agenda = require('agenda');
const ReminderDb = require('./reminder-db');
const notifications = require('./notifications');
const moment = require('moment');

const scheduler = (function () {
    const db = new ReminderDb();
    let agenda = null;

    function send(token, reminder) {
        const time = moment(reminder.date).format('hh:mm');
        const text = reminder.title + ' (' + reminder.type + ') at ' + time + ' in ' + reminder.room;
        console.log(text);
        return notifications.send(token, text);
    }

    function shortNotificationDue(user, reminder) {
        if (reminder.shortNotification) {
            return false; // already sent
        } else if (user.atLocation) {
            const reminderTime = moment(reminder.date);
            const triggerTime = moment();
            triggerTime.subtract(5, 'minutes');
            return reminderTime.isSameOrAfter(triggerTime);
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
