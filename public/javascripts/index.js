/*
 * Module to handle the script for the index page.
 */
(function () {
    const tabPages = ['upcoming', 'future', 'past', 'all'];
    const defaultTab = 'upcoming';
    const upcomingLimit = 6;
    let currentUser = null;
    let currentReminders = [];

    // Gets the date string.
    function getDate(date) {
        return app.padNumber(date.getDate()) + '/' +
            app.padNumber(date.getMonth() + 1) + '/' +
            date.getFullYear();
    }

    // Gets the duration string.
    function getDuration(date, duration) {
        const start = (date.getHours() * 60) + date.getMinutes();
        const end = start + parseInt(duration);
        const startHours = Math.floor(start / 60);
        const startMinutes = start - (startHours * 60);
        const endHours = Math.floor(end / 60);
        const endMinutes = end - (endHours * 60);
        return startHours + ':' + app.padNumber(startMinutes) +
            ' - ' + endHours + ':' + app.padNumber(endMinutes);
    }

    // Gets the room string.
    function getRoom(room) {
        const max = 10;
        if (room.length > max) {
            return room.substring(0, max) + "...";
        }
        return room;
    }

    // Gets the HTML for a single reminder.
    function getReminderHtml(reminder) {
        let html = '<h3>' + reminder.title + '</h3>';
        html += '<div class="row">';
        html += '<div class="col-sm">';
        html += reminder.type;
        html += '</div>';
        html += '<div class="col-sm">';
        html += getDate(reminder.dateObj);
        html += '</div>';
        html += '<div class="col-sm">';
        html += getDuration(reminder.dateObj, reminder.duration);
        html += '</div>';
        html += '<div class="col-sm" title="' + reminder.room + '">';
        html += getRoom(reminder.room);
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

    // Adds a single reminder list item to a list.
    function addReminderItem(ul, reminder) {
        const li = document.createElement('li');
        li.setAttribute('class', 'list-group-item reminder-list-item');
        li.innerHTML = getReminderHtml(reminder);
        ul.appendChild(li);
    }

    // Shows the message displayed when there are no reminders.
    function showNoRemindersMessage() {
        const content = document.getElementById('reminders-content');
        let html = '<div class="text-center no-reminders">'
        html += '<em>There are no reminders to display</em>';
        html += '</div>';
        content.innerHTML = html;
    }

    // Adds an array of reminders to the list.
    function addRemindersList(reminders) {
        const content = document.getElementById('reminders-content');
        content.innerHTML = '';
        const ul = document.createElement('ul');
        ul.setAttribute('class', 'list-group');
        ul.setAttribute('id', 'reminders-list');
        reminders.forEach(reminder => addReminderItem(ul, reminder));
        content.appendChild(ul);
    }

    // Redraws the reminders list to match the current state.
    function updateRemindersList(reminders) {
        if (reminders.length === 0) {
            showNoRemindersMessage();
        } else {
            addRemindersList(reminders);
            addDeleteReminderEvents();
        }
    }

    // Adds delete events to currently displayed reminders.
    function addDeleteReminderEvents() {
        const links = document.getElementsByClassName('delete-reminder');
        for (const link of links) {
            link.addEventListener('click', deleteReminder);
        }
    }

    // Removes a reminder from the UI list.
    function removeReminderFromList(link) {
        // parent: col.row.li
        const li = link.parentNode.parentNode.parentNode;
        const ul = document.getElementById('reminders-list');
        ul.removeChild(li);
    }

    // Handles the data event.
    async function deleteReminder(event) {
        event.preventDefault();
        if (confirm('Delete reminder?')) {
            const link = event.currentTarget;
            const id = link.getAttribute('data-id');
            await repository.deleteReminder(currentUser.token, id);
            removeReminderFromList(link);
        }
    }

    // Gets the active tab from the location hash.
    function getActiveTabFromHash() {
        if (location.hash && location.hash.length > 1) {
            const hash = location.hash.substr(1);
            if (tabPages.indexOf(hash) > -1) {
                return hash;
            }
        }
        return defaultTab;
    }

    // Add 'active' class to specified tab.
    function activateTab(activeTab) {
        tabPages.forEach(tab => {
            const tabLink = document.getElementById(tab + '-tab-link');
            if (tab === activeTab) {
                tabLink.classList.add('active');
            } else {
                tabLink.classList.remove('active');
            }
        });
        app.hideMessage();
    }

    // Gets reminders upcoming in the future.
    function getFutureReminders() {
        const now = new Date().getTime();
        return currentReminders.filter(reminder => {
            return reminder.dateObj.getTime() >= now;
        });
    }

    // Gets reminders that happened in the past.
    function getPastReminders() {
        const now = new Date().getTime();
        return currentReminders.filter(reminder => {
            return reminder.dateObj.getTime() < now;
        });
    }

    // Gets reminders limited by count.
    function getUpcomingReminders(count) {
        return getFutureReminders().slice(0, count);
    }

    // Gets reminders for the specified tab.
    function getRemindersForActiveTab(activeTab) {
        if (activeTab === 'upcoming') {
            return getUpcomingReminders(upcomingLimit);
        } else if (activeTab === 'future') {
            return getFutureReminders();
        } else if (activeTab === 'past') {
            return getPastReminders();
        } else {
            return currentReminders;
        }
    }

    // Updates the page to show reminders.
    function updatePage() {
        const activeTab = getActiveTabFromHash();
        const reminders = getRemindersForActiveTab(activeTab);
        updateRemindersList(reminders);
        activateTab(activeTab);
    }

    // Get reminders and log time
    async function getReminders() {
        const before = performance.timeOrigin + performance.now();
        const reminders = await repository.getReminders(currentUser);
        const after  = performance.timeOrigin + performance.now();
        console.log("Reminders (ms): " + (after - before));
        return reminders;
    }

    // Loads the page when first loaded.
    async function loadPage() {
        const user = await dataStore.getUser();
        if (user) {
            currentUser = user;
            currentReminders = await getReminders();
            updatePage();
            window.onhashchange = updatePage;
        } else {
            // Redirect to login.
            location.href = '/login';
        }
    }

    app.start().then(loadPage);
}());
