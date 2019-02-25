const webPush = require('web-push');
const ReminderDb = require('./reminder-db');

const notifications = (function () {
    const db = new ReminderDb();

    webPush.setVapidDetails(
        'https://gcureminder.herokuapp.com/',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );

    function send(token, payload) {
        return db.getUser(token).then(user => {
            if (user && user.subscription) {
                const subscription = JSON.parse(user.subscription);
                return webPush.sendNotification(subscription, payload);
            } else {
                throw 'Could not find subscription for push notification';
            }
        });
    }

    function register(token, subscription) {
        return db.editUser(token, { subscription: JSON.stringify(subscription) });
    }

    return {
        send: send,
        register: register
    }
}());

module.exports = notifications;