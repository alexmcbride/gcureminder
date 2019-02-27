const User = require('../models/user');
const Reminder = require('../models/reminder');
const moment = require('moment');

class ReminderDb {
    getAllReminders(token) {
        return User.findOne({ token: token }).exec().then(user => {
            if (user) {
                return Reminder.find({ userId: user._id }).sort('date').exec();
            } else {
                throw 'Invalid auth token';
            }
        })
    }

    getReminder(token, id) {
        return User.findOne({ token: token }).exec().then(user => {
            if (user) {
                return Reminder.findOne({ id: id, userId: user._id }).exec();
            } else {
                throw 'Invalid auth token';
            }
        });
    }

    addReminder(token, reminder) {
        return User.findOne({ token: token }).exec().then(user => {
            if (user) {
                return Reminder.createReminder(user, reminder);
            } else {
                throw 'Invalid auth token';
            }
        })
    }

    editReminder(token, reminder) {
        return User.findOne({ token: token }).exec().then(user => {
            if (user) {
                reminder.userId = user._id;
                return Reminder.findOneAndUpdate({ id: reminder.id }, reminder).exec();
            } else {
                throw 'Invalid auth token';
            }
        });
    }

    editLongNotification(reminder, sent) {
        return Reminder.findOneAndUpdate({ id: reminder.id }, { longNotification: sent }).exec();
    }

    editShortNotification(reminder, sent) {
        return Reminder.findOneAndUpdate({ id: reminder.id }, { shortNotification: sent }).exec();
    }

    deleteReminder(token, id) {
        return User.findOne({ token: token }).exec().then(user => {
            if (user) {
                return Reminder.findOneAndDelete({ id: id }).exec();
            } else {
                throw 'Invalid auth token';
            }
        });
    }

    editNotified(reminder, notified) {
        return Reminder.findByIdAndUpdate(reminder._id, { notified: notified }).exec();
    }

    saveSettings(token, data) {
        return User.updateOne({ token: token }, data).exec();
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
        return User.findOne({ token: token }).exec();
    }

    getUserFromId(id) {
        return User.findById(id).exec();
    }

    editUser(token, data) {
        return User.updateOne({ token: token }, data).exec();
    }
}

module.exports = ReminderDb;