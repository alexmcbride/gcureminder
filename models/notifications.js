const webPush = require('web-push');
const ReminderDb = require('./reminder-db');

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
            user.subscriptions.forEach(async subscription => {
                await webPush.sendNotification(JSON.parse(subscription), payload);
            })
        } else {
            throw 'Could not find user for push notification';
        }
    }

    function register(token, subscription) {
        return db.addSubscription(token, subscription);
    }

    return {
        send: send,
        register: register
    }
}());

module.exports = notifications;