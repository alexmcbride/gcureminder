const User = require('../models/user');
const Reminder = require('../models/reminder');
const moment = require('moment');
const ical = require('ical');

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

    importCalendar(token, file) {
        // Get title from summary.
        function parseTitle(summary) {
            const tokens = summary.split(';')
            if (tokens.length == 2) {
                return tokens[0].trim();
            }
            return summary;
        }

        // Get type from summary.
        function parseType(summary) {
            const tokens = summary.split(';')
            if (tokens.length == 2) {
                return tokens[1].trim();;
            }
            return 'Other';
        }

        // We store duration as minutes.
        function parseDuration(start, endDate) {
            const end = moment(endDate);
            const duration = moment.duration(end.diff(start));
            return duration.asMinutes();
        }

        return User.authToken(token).then(async user => {
            const data = ical.parseFile(file.path);
            const promises = [];
            for (let k in data) {
                if (data.hasOwnProperty(k)) {
                    let ev = data[k];
                    const start = moment(ev.start);
                    if (ev.type == 'VEVENT' && start.isAfter()) {
                        const reminder = {
                            id: ev.uid,
                            title: parseTitle(ev.summary),
                            type: parseType(ev.summary),
                            room: ev.location,
                            date: ev.start,
                            duration: parseDuration(start, ev.end)
                        };
                        const promise = Reminder.createReminder(user, reminder);
                        promises.push(promise)
                    }
                }
            }
            await Promise.all(promises);
            return promises.length; // Return added count
        });
    }
}

module.exports = ReminderDb;