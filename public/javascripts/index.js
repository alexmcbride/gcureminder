/*
 * Module to handle index page.
 */
(function () {
    let currentUser = null;

    function getDate(date) {
        return util.padNumber(date.getDate()) + '/' +
            util.padNumber(date.getMonth() + 1) + '/' +
            date.getFullYear();
    }

    function getDuration(date, duration) {
        const start = (date.getHours() * 60) + date.getMinutes();
        const end = start + parseInt(duration);
        const startHours = (start / 60).toFixed(0);
        const startMinutes = start - startHours * 60;
        const endHours = (end / 60).toFixed(0);
        const endMinutes = end - endHours * 60;
        return startHours + ':' + util.padNumber(startMinutes) +
            ' - ' + endHours + ':' + util.padNumber(endMinutes);
    }

    function getReminderHtml(reminder) {
        const date = new Date(reminder.date);
        let html = '<h3>' + reminder.title + '</h3>';
        html += '<div class="row">';
        html += '<div class="col-sm">';
        html += reminder.type;
        html += '</div>';
        html += '<div class="col-sm">';
        html += getDate(date);
        html += '</div>';
        html += '<div class="col-sm">';
        html += getDuration(date, reminder.duration);
        html += '</div>';
        html += '<div class="col-sm">';
        html += reminder.room;
        html += '</div>';
        html += '<div class="col text-right">';
        html += ' <a href="/reminder#edit/' + reminder.id + '" class="edit-link">';
        html += '<img src="images/edit-ic.png" class="edit-icon" alt="Edit" title="Edit">';
        html += '</a> ';
        html += '<a href="#" class="delete-reminder" data-id="' + reminder.id + '" >';
        html += '<img src="images/delete-ic.png" class="delete-icon" alt="Delete" title="Delete">';
        html += '</a>';
        html += '</div>';
        html += '</div>';
        return html;
    }

    function addReminder(ul, reminder) {
        const li = document.createElement('li');
        li.setAttribute('class', 'list-group-item reminder-list-item');
        li.innerHTML = getReminderHtml(reminder);
        ul.appendChild(li);
    }

    function updateReminders(reminders) {
        const ul = document.getElementById('reminders-list');
        reminders.forEach(reminder => addReminder(ul, reminder));
        addDeleteReminderEvents();
    }

    function addDeleteReminderEvents() {
        const links = document.getElementsByClassName('delete-reminder');
        for (const link of links) {
            link.addEventListener('click', deleteReminder);
        }
    }

    async function deleteReminder(event) {
        if (confirm('Delete reminder?')) {
            const link = event.currentTarget;
            const id = link.getAttribute('data-id');
            await repository.deleteReminder(currentUser.token, id);
            removeReminderFromList(link);
        }
        return false; // Stop link from being loaded by browser.
    }

    function removeReminderFromList(link) {
        // parent: col.row.li
        const li = link.parentNode.parentNode.parentNode;
        const ul = document.getElementById('reminders-list');
        ul.removeChild(li);
        util.showMessage('Reminder removed!');
    }

    async function loadReminders() {
        await dataStore.init();
        const user = await dataStore.getUser();
        if (user) {
            currentUser = user;
            const reminders = await repository.getReminders(user._id, user.token);
            updateReminders(reminders);
        } else {
            location.href = '/login';
        }
    }
    
    util.start().then(loadReminders);
}());
