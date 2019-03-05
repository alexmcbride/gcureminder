const express = require('express');
const ReminderDb = require('../models/reminder-db');

const router = express.Router();
const db = new ReminderDb();

function saveSettings(req, res, data) {
    const token = req.body.token;
    db.saveSettings(token, data)
        .then(user => res.json({ success: true }))
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
}

/* POST save distance settings */
router.post('/distance', (req, res, next) => {
    const data = req.body.data;
    saveSettings(req, res, { distance: data.distance });
});

/* POST save location settings */
router.post('/location', (req, res, next) => {
    const data = req.body.data;
    saveSettings(req, res, { latitude: data.latitude, longitude: data.longitude });
});

/* POST save at location flag */
router.post('/at-location', (req, res, next) => {
    const data = req.body.data;
    saveSettings(req, res, { atLocation: data.atLocation });
});

module.exports = router;