const express = require('express');
const ReminderDb = require('../models/reminder-db');

const db = new ReminderDb();
const router = express.Router();

/* GET all reminders as JSON */
router.get('/list/:token', (req, res, next) => {
    const token = req.params.token;
    db.getAllReminders(token).then(reminders => {
        res.json(reminders);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

/* POST add reminder to data store */
router.post('/add', (req, res, next) => {
    const token = req.body.token;
    const reminder = req.body.data;
    db.addReminder(token, reminder).then(reminder => {
        res.json({ success: true, reminder: reminder });
    }).catch(err => {
        // todo: clean up errors, as dumping whole obj is a bit weird.
        res.json({ success: false, error: err.message });
    });
});

/* POST update reminder in data store */
router.post('/edit', (req, res, next) => {
    const token = req.body.token;
    const reminder = req.body.data;
    db.editReminder(token, reminder).then(reminder => {
        res.json({ success: true, reminder: reminder });
    }).catch(err => {
        res.json({ success: false, error: err });
    });
});

/* POST delete reminder from data store */
router.post('/delete/:id', (req, res, next) => {
    const id = req.params.id;
    const token = req.body.token;
    db.deleteReminder(token, id).then(() => {
        res.json({ success: true, id: id });
    }).catch(err => {
        res.json({ success: false, error: err });
    });
});

/* GET get single reminder as JSON */
router.get('/:token/:id', (req, res, next) => {
    const id = req.params.id;
    const token = req.params.token;
    db.getReminder(token, id)
        .then(reminder => res.json(reminder))
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
});

module.exports = router;