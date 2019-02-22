var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var mongoose = require('mongoose');
var Agenda = require('agenda');

var indexRouter = require('./routes/index');
var remindersRouter = require('./routes/reminders');
var usersRouter = require('./routes/users');
var settingsRouter = require('./routes/settings');

var ReminderDb = require('./models/reminder-db');

var app = express();
const db = new ReminderDb();

async function checkReminders() {
  console.log('Check reminders');
  const minutes = 1;
  const reminders = await db.getPendingReminders(minutes);
  reminders.forEach(reminder => {
    const user = await db.getUser(reminder.userId);
    if (user.atLocation) {
      console.log('Location push notification for ' + reminder.title);
    } else {
      console.log('Push notification for ' + reminder.title);
    }
    await db.editReminded(reminder, true);
  });
}

// mongoose setup
const mongoDbUri = process.env.MONGODB_URI
mongoose.connect(mongoDbUri, { useNewUrlParser: true, autoIndex: false }).then(() => {
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'Connection error:'));

  // agenda scheduler
  const agenda = new Agenda().mongo(db, 'jobs');
  agenda.define('check reminders', checkReminders);
  agenda.every('1 minute', 'check reminders');
  agenda.start();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/users', usersRouter);
app.use('/api/settings', settingsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// configure development mode
var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
  app.locals.pretty = true; // Stop express minifying HTML
}

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
