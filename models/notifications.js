const webPush = require('web-push');
const ReminderDb = require('./reminder-db');
const User = require('./user');

const notifications = (function () {
    const db = new ReminderDb();

    webPush.setVapidDetails(
        'https://gcureminder.herokuapp.com/',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );

    function send(userId, payload) {
        // todo: if not registered then remove from subscriptions
        return db.getUserFromId(userId).then(user => {
            if (user) {
                const promises = user.subscriptions.map(subscription => {
                    return webPush.sendNotification(JSON.parse(subscription), payload);
                });
                return Promise.all(promises);
            } else {
                throw 'Could not find user for push notification';
            }
        });
    }

    function register(token, subscription) {
        subscription = JSON.stringify(subscription); // mongo db expects a string
        return User.findByToken(token).then(user => {
            if (user == null) {
                throw 'Invalid auth token';
            } else if (user.subscriptions.includes(subscription)) {
                throw 'Subscription already in list';
            } else {
                console.log('Subscribed to push notification');
                user.subscriptions.push(subscription);
                return user.save();
            }
        })
    }

    return {
        send: send,
        register: register
    }
}());

module.exports = notifications;