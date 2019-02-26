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
                    Reminder.createReminder(user, reminder)
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

    editLongNotification(reminder, sent) {
        return Reminder.findOneAndUpdate({ id: reminder.id }, { longNotification: sent }).exec();
    }

    editShortNotification(reminder, sent) {
        return Reminder.findOneAndUpdate({ id: reminder.id }, { shortNotification: sent }).exec();
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

    editNotified(reminder, notified) {
        return Reminder.findByIdAndUpdate(reminder._id, { notified: notified });
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

    getPendingReminders() {
        const hours = 1;
        const now = new Date();
        const start = new Date(now.getTime() - (hours * 60000));
        return Reminder.where('date')
            .gt(start)
            .or([{ shortNotification: false }, { longNotification: false }])
            .exec();
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