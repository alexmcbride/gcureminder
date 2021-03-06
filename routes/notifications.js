const express = require('express');
const notifications = require('../models/notifications');
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
    const userId = req.body.userId;
    notifications.send(userId, { type: 'text', title: 'Test', text: 'Sent from the server!' }).then(() => {
        res.sendStatus(201);
    }).catch(error => {
        console.log(error);
        res.sendStatus(500);
    });
});

module.exports = router;