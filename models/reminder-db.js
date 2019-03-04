const User = require('../models/user');
const Reminder = require('../models/reminder');
const moment = require('moment');

class ReminderDb {
    getAllReminders(token) {
        return User.authToken(token).then(user => {
            return Reminder.find({ userId: user._id }).sort('date').exec();
        });
    }

    getReminder(token, id) {
        return User.authToken(token).then(user => {
            return Reminder.findOne({ id: id, userId: user._id }).exec();
        });
    }

    addReminder(token, reminder) {
        return User.authToken(token).then(user => {
            return Reminder.createReminder(user, reminder);
        })
    }

    dateChanged(a, b) {
        const dateA = moment(a.date);
        const dateB = moment(b.date);
        return !dateA.isSame(dateB);
    }

    editReminder(token, reminder) {
        return User.authToken(token).then(user => {
            reminder.userId = user._id;
            return Reminder.findOne({ id: reminder.id }).exec();
        }).then(document => {
            // If date changed reset notification flags
            if (this.dateChanged(document, reminder)) {
                reminder.longNotification = false;
                reminder.shortNotification = false;
            }
            return Reminder.findOneAndUpdate({ id: reminder.id }, reminder).exec();
        });;
    }

    editLongNotification(reminder, sent) {
        return Reminder.findOneAndUpdate({ id: reminder.id }, { longNotification: sent }).exec();
    }

    editShortNotification(reminder, sent) {
        return Reminder.findOneAndUpdate({ id: reminder.id }, { shortNotification: sent }).exec();
    }

    deleteReminder(token, id) {
        return User.authToken(token).then(user => {
            return Reminder.findOneAndDelete({ id: id }).exec();
        });
    }

    editNotified(reminder, notified) {
        return Reminder.findByIdAndUpdate(reminder._id, { notified: notified }).exec();
    }

    saveSettings(token, data) {
        return User.updateOne({ tokens: token }, data).exec();
    }

    getPendingReminders() {
        const start = moment().toDate();
        const end = moment().add(1, 'hour').toDate();
        return Reminder.find({
            date: { '$gt': start, '$lt': end },
            '$or': [{ shortNotification: false }, { longNotification: false }]
        }).exec();
    }

    getUser(token) {
        return User.authToken(token);
    }

    getUserFromId(id) {
        return User.findById(id).exec();
    }

    editUser(token, data) {
        return User.updateOne({ tokens: token }, data).exec();
    }
}

module.exports = ReminderDb;