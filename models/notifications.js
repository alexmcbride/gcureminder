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

    async function send(token, payload) {
        const user = await db.getUser(token);
        if (user) {
            const promises = user.subscriptions.map(subscription => {
                return webPush.sendNotification(JSON.parse(subscription), payload);
            });
            Promise.all(promises);
        } else {
            throw 'Could not find user for push notification';
        }
    }

    function register(token, subscription) {
        return new Promise((resolve, reject) => {
            subscription = JSON.stringify(subscription);
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