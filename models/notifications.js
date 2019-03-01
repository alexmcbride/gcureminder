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
                return Promise.all(promises);
            } else {
                throw 'Could not find user for push notification';
            }
        });
    }

    function register(token, subscription) {
        subscription = JSON.stringify(subscription); // mongo db expects a string
        return User.authToken(token).then(user => {
            if (user.subscriptions.includes(subscription)) {
                console.log('Subscription already in list');
                return Promise.resolve();
            } else {
                console.log('Subscribed to push notification');
                user.subscriptions.push(subscription);
                return user.save();
            }
        });
    }

    function reregister(token, subscription, oldSubscription) {
        subscription = JSON.stringify(subscription); // mongo db expects a string
        oldSubscription = JSON.stringify(oldSubscription);
        return User.authToken(token).then(user => {
            user.subscriptions.pull(oldSubscription);
            user.subscriptions.push(subscription);
            return user.save().then(() => {
                console.log('Re-subscribed to push notification');
            });
        });
    }

    return {
        send: send,
        register: register,
        reregister: reregister
    }
}());

module.exports = notifications;