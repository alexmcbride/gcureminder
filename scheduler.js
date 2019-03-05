const moment = require('moment');
const mongoose = require('mongoose');
const User = require('./models/user');
const Reminder = require('./models/reminder');
const notifications = require('./models/notifications');

function getReminderText(reminder) {
    const timeStr = moment(reminder.date).format('HH:mm');
    return reminder.title + ' (' + reminder.type + ') at ' + timeStr + ' in ' + reminder.room;
}

function reminderDueWithin(reminder, amount, unit) {
    const reminderDate = moment(reminder.date);
    const endDate = moment().add(amount, unit);
    return reminderDate.isSameOrAfter() && reminderDate.isSameOrBefore(endDate);
}

async function checkLongNotification(reminder) {
    if (!reminder.longNotification) {
        if (reminderDueWithin(reminder, 1, 'hour')) {
            const text = getReminderText(reminder);
            console.log('Sending reminder: ' + text + ' to user ' + reminder.userId);
            await notifications.send(reminder.userId, text);
            reminder.longNotification = true;
            await reminder.save();
        }
    }
}

async function checkShortNotification(reminder, atLocation) {
    if (!reminder.shortNotification) {
        if (reminderDueWithin(reminder, 5, 'minutes') && atLocation) {
            await notifications.send(reminder.userId, getReminderText(reminder));
            reminder.shortNotification = true;
            await reminder.save();
        }
    }
}

async function checkReminder(reminder) {
    const user = await User.findById(reminder.userId).exec();
    if (user == null) {
        console.log('User not found for reminder: ' + reminder._id);
    } else {
        await checkLongNotification(reminder);
        await checkShortNotification(reminder, user.atLocation);
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
    try {
        mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'Connection error:'));

        console.log('Checking reminders...');
        const reminders = await findUpcomingReminders();
        const promises = reminders.map(checkReminder);
        await Promise.all(promises);
    } catch (err) {
        console.log(err);
    }
}

run();