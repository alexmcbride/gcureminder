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
* Upgrading service worker when it changes

The app comprises and front and back end. The frontend is pure JavaScript and runs on modern web browsers, although some features such as background sync will only work on Chrome. The backend is a Node.js and express app, backed with Mongo DB. It serves up the pages initially and then acts as a Restful API exchanging JSON with the browser. There is a scheduller that runs every minute and checks for upcoming reminders, that then sends push notifications to subscribed clients. 

The app uses the following libraries (all on the backend except for Bootstrap CSS).

* Agenda job scheduling
* Moment time library
* Mongoose.js for mongo DB support
* WebPush for push notifications
