const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    userId: { type: String, index: true },
    title: { type: String, trim: true, required: true },
    type: { type: String, trim: true, required: true },
    room: { type: String, trim: true, required: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
