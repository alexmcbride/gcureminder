const moment = require('moment');
const User = require('./models/user');
const Reminder = require('./models/reminder');
const notifications = require('./models/notifications');

function getReminderText(reminder, date) {
    const timeStr = date.format('HH:mm');
    return reminder.title + ' (' + reminder.type + ') at ' + timeStr + ' in ' + reminder.room;
}

function isReminderDue(reminder, amount, unit) {
    const reminderDate = moment(reminder.date);
    const triggerDate = moment().add(amount, unit);
    return reminderDate.isSameOrAfter(triggerDate);
}

async function checkLongNotification(reminder, user) {
    if (!reminder.longNotification) {
        if (isReminderDue(reminder, 1, 'hour')) {
            await notifications.send(reminder.userId, getReminderText(reminder, reminderDate));
            user.longNotification = true;
            await user.save();
        }
    }
}

async function checkShortNotification(reminder, user) {
    if (!reminder.shortNotification && user.atLocation) {
        if (isReminderDue(reminder, 5, 'minutes')) {
            await notifications.send(reminder.userId, getReminderText(reminder, reminderDate));
            user.shortNotification = true;
            await user.save();
        }
    }
}

async function checkReminder(reminder) {
    const user = await User.findById(reminder.userId).exec();
    await checkLongNotification(reminder, user);
    await checkShortNotification(reminder, user);
}

function findUpcomingReminders() {
    const start = moment();
    const end = moment();
    const end = end.add(1, 'hour');
    return Reminder.find({
        date: { '$gt': start.toDate(), '$lt': end.toDate() },
        '$or': [{ shortNotification: false }, { longNotification: false }]
    }).exec();
}

function run() {
    const reminders = await findUpcomingReminders();
    reminders.map(checkReminder).forEach(async reminder => {
        await reminder;
    });
}

module.exports = {
    run: run
};