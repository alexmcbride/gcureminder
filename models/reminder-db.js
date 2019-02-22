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
                    Reminder.findOne({ id: id, userId: user._id })
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
                    Reminder.findOneAndUpdate({ id: reminder.id }, reminder)
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
                    Reminder.findOneAndDelete({ id: id }).then(resolve).catch(reject);
                } else {
                    reject('Invalid auth token');
                }
            }).catch(reject);
        });
    }

    editReminded(reminder, reminded) {
        return Reminder.findByIdAndUpdate(reminder._id, { reminded: reminded });
    }

    saveSettings(token, data) {
        return new Promise((resolve, reject) => {
            User.updateOne({ token: token }, data, (err, user) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            });
        });
    }

    getPendingReminders(minutes) {
        return new Promise((resolve, reject) => {
            const end = new Date();
            const start = end.getTime() - (minutes * 1000);
            Reminder.find({ date: { '$gt': start, '$lt': end }, reminded: { '$eq': false } })
                .then(resolve)
                .catch(reject);
        });
    }
}

module.exports = ReminderDb;