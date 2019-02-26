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

    function send(token, payload) {
        return db.getUser(token).then(user => {
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
        return new Promise((resolve, reject) => {
            subscription = JSON.stringify(subscription); // mongo db expects a string
            User.find({ token: token, subscriptions: subscription }).exec().then(users => {
                if (users.length > 0) {
                    resolve(); // already subscribed
                } else {
                    User.updateOne({ token: token }, { '$push': { subscriptions: subscription } })
                        .exec()
                        .then(resolve)
                        .catch(reject);
                }
            }).catch(reject);
        });
    }

    return {
        send: send,
        register: register
    }
}());

module.exports = notifications;