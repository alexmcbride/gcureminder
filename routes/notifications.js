const express = require('express');
const notifications = require('../models/notifications');
const scheduler = require('../models/scheduler');

const router = express.Router();

router.get('/vapidPublicKey', (req, res) => {
    res.send(process.env.VAPID_PUBLIC_KEY);
});

router.post('/register', (req, res) => {
    const token = req.body.token;
    const subscription = req.body.subscription;
    notifications.register(token, subscription).then(() => {
        res.sendStatus(201);
    }).catch(error => {
        console.log(error);
        res.sendStatus(500);
    });
});

router.post('/test', (req, res) => {
    const token = req.body.token;
    notifications.send(token, 'Sent from the server!').then(() => {
        res.sendStatus(201);
    }).catch(error => {
        console.log(error);
        res.sendStatus(500);
    });
});

router.get('/check-reminders', (req, res) => {
    scheduler.checkReminders().then(() => {
        res.sendStatus(200);
    }).catch(error => {
        console.log(error);
        res.sendStatus(500);
    });

});

module.exports = router;