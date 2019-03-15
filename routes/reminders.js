const express = require('express');
const ReminderDb = require('../models/reminder-db');
const scheduler = require('../models/scheduler');
const formidable = require('formidable')

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
        console.log(err.message);
        res.sendStatus(500);
    });
});

/* POST update reminder in data store */
router.post('/edit', (req, res, next) => {
    const token = req.body.token;
    const reminder = req.body.data;
    db.editReminder(token, reminder).then(reminder => {
        res.json({ success: true, reminder: reminder });
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

router.get('/check', (req, res) => {
    scheduler.run().then(() => {
        res.sendStatus(200);
    }).catch(error => {
        console.log(error);
        res.sendStatus(500);
    });
});

router.post('/upload', (req, res) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = '/tmp/';
    form.encoding = 'utf-8';
    form.keepExtensions = true;

    form.parse(req, (error, fields, files) => {
        if (error) {
            console.log(error);
            res.sendStatus(500);
        } else {
            console.log('File uploaded: ' + files.upload.path);
            db.importCalendar(fields.token, files.upload).then(addedCount => {
                res.statusCode = 201;
                res.status(201).json({
                    addedCount: addedCount
                });
                
            }).catch(error => {
                console.log(error);
                res.sendStatus(500);
            });;
        }
    })
});

module.exports = router;