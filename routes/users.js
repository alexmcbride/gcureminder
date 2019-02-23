const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* POST auth existing username or create new account  */
router.post('/login', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    User.login(username, password).then(user => {
        res.json({
            success: true, user: {
                token: user.token,
                longitude: user.longitude,
                latitude: user.latitude,
                distance: user.distance
            }
        });
    }).catch(err => {
        res.json({ success: false, error: err });
    });
});

module.exports = router;
