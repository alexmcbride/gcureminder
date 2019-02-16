const User = require('../models/user');
const Reminder = require('../models/reminder');

class ReminderDb {
    getAllReminders(token) {
        return new Promise((resolve, reject) => {
            User.findOne({ token: token }).then(user => {
                if (user) {
                    Reminder.find({ userId: user._id })
                        .sort('date')
                        .then(resolve)
                        .catch(reject);
                } else {
                    resolve([]);
                }
            }).catch(reject);
        });
    }

    getReminder(token, id) {
        return new Promise((resolve, reject) => {
            User.findOne({ token: token }).then(user => {
                if (user) {
                    Reminder.findOne({ _id: id, userId: user._id })
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject('Invalid auth token');
                }
            }).catch(reject);
        });
    }

    addReminder(token, reminder) {
        return new Promise((resolve, reject) => {
            User.findOne({ token: token }).then(user => {
                if (user) {
                    reminder.userId = user._id;
                    Reminder.create(reminder)
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject('Invalid auth token');
                }
            }).catch(reject);
        });
    }

    editReminder(token, reminder) {
        return new Promise((resolve, reject) => {
            User.findOne({ token: token }).then(user => {
                if (user) {
                    reminder.userId = user._id;
                    Reminder.findByIdAndUpdate(reminder._id, reminder)
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject('Invalid auth token');
                }
            }).catch(reject);
        });
    }

    deleteReminder(token, id) {
        return new Promise((resolve, reject) => {
            User.findOne({ token: token }).then(user => {
                if (user) {
                    Reminder.findByIdAndDelete(id).then(resolve).catch(reject);
                } else {
                    reject('Invalid auth token');
                }
            }).catch(reject);
        });
    }
}

module.exports = ReminderDb;