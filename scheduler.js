function run() {
    // get reminders upcoming in the next hour that have either notification flag set to false
    // loop through reminders
    // get user for reminder from DB
    // if the reminder is due in one hour
    // send long notification to user
    // set long notification flag
    // save user to DB
    // else if reminder is due in five minutes and user is at location
    // send short notification to user
    // set short notification flag
    // end
    // end loop

    console.log('Cron job run!');
}

module.exports = {
    run: run
};