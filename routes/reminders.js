const express = require('express');
const ReminderDb = require('../models/reminder-db');
const scheduler = require('../models/scheduler');

const db = new ReminderDb();
const router = express.Router();

function getResponseReminder(reminder) {
    return {
        id: reminder.id,
        title: reminder.title,
        type: reminder.type,
        room: reminder.room,
        date: reminder.date,
        duration: reminder.duration
    }
}

/* GET all reminders as JSON */
router.get('/list/:token', (req, res, next) => {
    const token = req.params.token;
    db.getAllReminders(token).then(reminders => {
        res.json(reminders.map(getResponseReminder));
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
        res.json({ success: true, reminder: getResponseReminder(reminder) });
    }).catch(err => {
        console.log(err.message);
        res.sendStatus(500);
    });
});

/* POST update reminder in data store */
router.post('/edit', (req, res, next) => {
    const token = req.body.token;
    const reminder = req.body.data;
    db.editReminder(token, reminder).then(reminder => {
        res.json({ success: true, reminder: getResponseReminder(reminder) });
    }).catch(err => {
        console.log(err.message);
        res.sendStatus(500);
    });
});

/* POST delete reminder from data store */
router.post('/delete/:id', (req, res, next) => {
    const id = req.params.id;
    const token = req.body.token;
    db.deleteReminder(token, id).then(() => {
        res.json({ success: true, id: id });
    }).catch(err => {
        console.log(err.message);
        res.sendStatus(500);
    });
});

router.get('/check/:token', (req, res) => {
    const token = req.params.token;
    if (process.env.CHECK_REMINDER_TOKEN == token) {
        scheduler.run().then(() => {
            res.sendStatus(200);
        }).catch(error => {
            console.log(error);
            res.sendStatus(500);
        });
    } else {
        console.log('Check reminder token does not match');
        res.sendStatus(401);
    }
});

/* GET get single reminder as JSON */
router.get('/:token/:id', (req, res, next) => {
    const id = req.params.id;
    const token = req.params.token;
    db.getReminder(token, id)
        .then(reminder => res.json(getResponseReminder(reminder)))
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
});

module.exports = router;