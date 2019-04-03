const moment = require('moment');
const User = require('./user');
const Reminder = require('./reminder');
const notifications = require('./notifications');

function dueWithin(reminder, amount, unit) {
    const reminderDate = moment(reminder.date);
    const endDate = moment().add(amount, unit);
    return reminderDate.isSameOrAfter() && reminderDate.isSameOrBefore(endDate);
}

function sendNotification(reminder) {
    return notifications.send(reminder.userId, { type: 'reminder', id: reminder.id });
}

async function checkLongNotification(reminder) {
    if (!reminder.longNotification && dueWithin(reminder, 1, 'hour')) {
        await sendNotification(reminder);
        reminder.longNotification = true;
        await reminder.save();
    }
}

async function checkShortNotification(reminder, atLocation) {
    if (!reminder.shortNotification && dueWithin(reminder, 5, 'minutes') && atLocation) {
        await sendNotification(reminder);
        reminder.shortNotification = true;
        reminder.longNotification = true; // If short notification sent no point sending long one.
        await reminder.save();
    }
}

async function checkReminder(reminder) {
    const user = await User.findById(reminder.userId).exec();
    if (user == null) {
        console.log('User not found for reminder: ' + reminder._id);
    } else {
        await checkShortNotification(reminder, user.atLocation);
        await checkLongNotification(reminder);
    }
}

function findUpcomingReminders() {
    const start = moment();
    const end = moment().add(1, 'hour');
    return Reminder.find({
        date: { '$gt': start.toDate(), '$lt': end.toDate() },
        '$or': [{ shortNotification: false }, { longNotification: false }]
    }).exec();
}

async function run() {
    const time = moment().format('HH:mm');
    console.log(time + ' - checking reminders...');
    const reminders = await findUpcomingReminders();
    if (reminders.length > 0) {
        const promises = reminders.map(checkReminder);
        await Promise.all(promises);
    }
}

module.exports = {
    run: run
}