/*
 * Node script run by cron every minute, that checks for upcoming reminders. Note: the env variables
 * needed to run the scripts need to be added to the crontab -e file.
 */

const scheduler = require('./models/scheduler');
const mongoose = require('mongoose');

try {
    // Setup DB.
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Connection error:'));

    // Check for reminders.
    scheduler.run();
}
catch (err) {
    console.log(err);
}