const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* POST auth existing email or create new account  */
router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.login(email, password).then(user => {
        res.json({
            success: true, user: {
                token: user.token,
                longitude: user.longitude,
                latitude: user.latitude,
                distance: user.distance
            }
        });
    }).catch(err => {
        res.json({ success: false, message: err });
    });
});

module.exports = router;
