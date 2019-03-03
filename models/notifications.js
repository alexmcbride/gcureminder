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

    function removeSubscription(user, subscription) {
        user.subscriptions.pull(subscription);
        return user.save().then(() => {
            console.log('Removed problem subscription');
        });
    }

    function send(userId, payload) {
        return db.getUserFromId(userId).then(user => {
            if (user) {
                const promises = user.subscriptions.map(subscription => {
                    return webPush.sendNotification(JSON.parse(subscription), payload).catch(err => {
                        console.log(err);
                        return removeSubscription(user, subscription);
                    });
                });
                promises.forEach(async promise => {
                    await promise;
                });
            } else {
                return Promise.reject('Could not find user for push notification');
            }
        });
    }

    function register(token, subscription) {
        subscription = JSON.stringify(subscription);
        return User.authToken(token).then(user => {
            if (user.subscriptions.includes(subscription)) {
                console.log('Subscription already in list');
                return Promise.resolve(); // smile and go with it
            } else {
                console.log('Subscribed to push notification');
                user.subscriptions.push(subscription);
                return user.save();
            }
        });
    }

    return {
        send: send,
        register: register
    }
}());

module.exports = notifications;