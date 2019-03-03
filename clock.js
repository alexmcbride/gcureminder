/*
 * Tells Heroku when to run our scheduler
 */

var CronJob = require('cron').CronJob;
var scheduler = require('./scheduler.js');

var job = new CronJob({
  cronTime: "* 8-18 * * *", // Between 8am and 6pm every day
  onTick: scheduler.run(),
  start: true,
  timeZone: "Europe/London"
});

job.start();