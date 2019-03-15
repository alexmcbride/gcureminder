const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const remindersRouter = require('./routes/reminders');
const usersRouter = require('./routes/users');
const settingsRouter = require('./routes/settings');
const notificationsRouter = require('./routes/notifications');

const app = express();

// mongo db setup
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, autoIndex: false });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// other stuff
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

// routes
app.use('/', indexRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/users', usersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/notifications', notificationsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// configure development mode
const env = process.env.NODE_ENV || 'development';
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
