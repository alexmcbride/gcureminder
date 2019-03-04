const mongoose = require('mongoose');
const moment = require('moment');

const reminderSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    userId: { type: String, index: true },
    title: { type: String, trim: true, required: true },
    type: { type: String, trim: true, required: true },
    room: { type: String, trim: true, required: true },
    date: {
        type: Date, required: true, validate: {
            validator: function (v) {
                return moment(v).isAfter();
            },
            message: 'Reminder date should be in the future'
        }
    },
    duration: { type: Number, required: true },
    shortNotification: { type: Boolean, required: true },
    longNotification: { type: Boolean, required: true },
});

reminderSchema.statics.createReminder = function (user, reminder) {
    reminder.userId = user._id;
    reminder.shortNotification = false;
    reminder.longNotification = false;
    return this.model('Reminder').create(reminder);
}

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
