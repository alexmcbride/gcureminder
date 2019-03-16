# GCU Reminder

App built as part of fourth year honours project at Glasgow Caledonian University. The app uses Service Worker API to implement offline functionality.

The app is a simple reminder app, that sends you notifications when lectures or classes are about to start. You can add, edit, and delete reminders, as well as set your location. You are sent a reminder one hour before class starts, however if you are on university grounds you also get a notification five minutes before.

The app was designed to cover the following Service Worker API use cases:

* Caching shell of the application for use offline
* Fetching 'live' data using Fetch API
* Storing data locally using Indexed DB for access offline
* Background queuing and syncing of data when offline/online
* Web push notifications
* Handle running operations outside of lifecycle of single page
* Sending messages from the Service Worker to a page
* Upgrading service worker when it changes

The frontend of the app is pure JavaScript and runs on modern web browsers, although some features such as background sync will only work on Chrome. The backend is a Node.js and express app, backed with Mongo DB. It serves up the pages initially and then acts as a Restful API exchanging JSON with the browser. 

Of course, the site must also check for upcoming reminders so the user can be notifed of them. To do this there is a cron job that runs a special script (./scheduler.sh) once a minute, between the hours of 8am and 6pm. This script simply makes an HTTP GET request to a route on the server, which then checks for reminders and sends out push notifications to subscribed clients.

The app uses the following libraries (all on the backend).

* [Moment time library](https://github.com/moment/moment/)
* [Mongoose.js for mongo DB support](https://github.com/Automattic/mongoose)
* [WebPush for push notifications](https://github.com/web-push-libs/web-push)
* [node-uuid for generating unique identifiers](https://github.com/kelektiv/node-uuid)
* [ical-node for processing calendar files](https://github.com/jens-maus/node-ical)
* [Formidable uploading files](https://github.com/felixge/node-formidable)

Note iCal needs to be cloned and installed from the folder, as the version published on NPM is years out of date.

To run the site locally you need to add some environment variables to your ~/.bashrc file:

```
export MONGODB_URI='mongodb://localhost/gcuminder'
export VAPID_PUBLIC_KEY="<PUBLIC KEY>"
export VAPID_PRIVATE_KEY="<PRIVATE KEY>"
export CHECK_REMINDER_TOKEN="<SECRET KEY>"
```

The CHECK_REMINDER_TOKEN env variable needs to go in the cron job as well, as it has its own list of environment variables. Find out more about vapid keys, needed for push notifications, [here](https://github.com/web-push-libs/web-push).
