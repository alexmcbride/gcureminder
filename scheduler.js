const scheduler = require('./models/scheduler');
const mongoose = require('mongoose');

try {
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Connection error:'));

    scheduler.run();
}
catch (err) {
    console.log(err);
}