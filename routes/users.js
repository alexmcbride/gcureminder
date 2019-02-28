const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* POST auth existing username or create new account  */
router.post('/login', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    User.login(username, password).then(data => {
        const user = data.user;
        res.json({
            success: true, user: {
                _id: user._id,
                token: data.token,
                longitude: user.longitude,
                latitude: user.latitude,
                distance: user.distance
            }
        });
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

router.post('/logout', (req, res, next) => {
    const token = req.body.token;
    User.logout(token).then(() => {
        res.sendStatus({ success: true });
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

module.exports = router;
