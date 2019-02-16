const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* POST save settings */
router.post('/distance', (req, res, next) => {
    const token = req.body.token;
    const distance = req.body.distance;
    User.update({ token: token }, { distance: distance }, (err, user) => {
        if (err) {
            res.json({ success: false, err: err });
        } else {
            res.json({ success: true });
        }
    });
});

/* POST save settings */
router.post('/location', (req, res, next) => {
    const token = req.body.token;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    User.update({ token: token }, { latitude: latitude, longitude: longitude }, (err, user) => {
        if (err) {
            res.json({ success: false, err: err });
        } else {
            res.json({ success: true });
        }
    });
});

module.exports = router;