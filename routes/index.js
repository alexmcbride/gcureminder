const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index');
});

/* GET add/edit reminder page. */
router.get('/reminder', (req, res, next) => {
    res.render('reminder');
});

/* GET settings page. */
router.get('/settings', (req, res, next) => {
    res.render('settings');
});

/* GET login page. */
router.get('/login', (req, res, next) => {
    res.render('login');
});

module.exports = router;
