const User = require('../models/user');
const Reminder = require('../models/reminder');
const moment = require('moment');

class ReminderDb {
    async getAuthUser(token) {
        const user = await User.findByToken(token);
        if (user == null) {
            throw 'Invalid auth token';
        } else {
            return user;
        }
    }

    getAllReminders(token) {
        return this.getAuthUser(token).then(user => {
            return Reminder.find({ userId: user._id }).sort('date').exec();
        });
    }

    getReminder(token, id) {
        return this.getAuthUser(token).then(user => {
            return Reminder.findOne({ id: id, userId: user._id }).exec();
        });
    }

    addReminder(token, reminder) {
        return this.getAuthUser(token).then(user => {
            return Reminder.createReminder(user, reminder);
        })
    }

    editReminder(token, reminder) {
        return this.getAuthUser(token).then(user => {
            reminder.userId = user._id;
            return Reminder.findOneAndUpdate({ id: reminder.id }, reminder).exec();
        });
    }

    editLongNotification(reminder, sent) {
        return Reminder.findOneAndUpdate({ id: reminder.id }, { longNotification: sent }).exec();
    }

    editShortNotification(reminder, sent) {
        return Reminder.findOneAndUpdate({ id: reminder.id }, { shortNotification: sent }).exec();
    }

    deleteReminder(token, id) {
        return this.getAuthUser(token).then(user => {
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
        return User.findByToken(token);
    }

    getUserFromId(id) {
        return User.findById(id).exec();
    }

    editUser(token, data) {
        return User.updateOne({ tokens: token }, data).exec();
    }
}

module.exports = ReminderDb;