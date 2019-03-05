const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* POST auth existing username or create new account  */
router.post('/login', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    User.login(username, password).then(data => {
        if (data.success) {
            res.json({
                success: true,
                user: {
                    _id: data.user._id,
                    token: data.token,
                    longitude: data.user.longitude,
                    latitude: data.user.latitude,
                    distance: data.user.distance
                }
            });
        } else {
            res.json({ success: false });
        }
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

router.post('/logout', (req, res, next) => {
    const token = req.body.token;
    User.logout(token).then(() => {
        res.send({ success: true });
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

module.exports = router;
