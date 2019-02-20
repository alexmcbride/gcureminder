const express = require('express');
const ReminderDb = require('../models/reminder-db');

const router = express.Router();
const db = new ReminderDb();

function saveSettings(req, res, data) {
    const token = req.body.token;
    db.saveSettings(token, data)
        .then(user => res.json({ success: true }))
        .catch(err => res.json({ success: false, error: err }));
}

/* POST save distance settings */
router.post('/distance', (req, res, next) => {
    const distance = req.body.distance;
    saveSettings(req, res, { distance: distance });
});

/* POST save location settings */
router.post('/location', (req, res, next) => {
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    saveSettings(req, res, { latitude: latitude, longitude: longitude });
});

/* POST save at location flag */
router.post('/at-location', (req, res, next) => {
    const atLocation = req.body.atLocation;
    saveSettings(req, res, { atLocation: atLocation });
});

module.exports = router;