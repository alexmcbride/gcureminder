/*
 * Module to handle the script for the index page.
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

    function addReminderItem(ul, reminder) {
        const li = document.createElement('li');
        li.setAttribute('class', 'list-group-item reminder-list-item');
        li.innerHTML = getReminderHtml(reminder);
        ul.appendChild(li);
    }

    function showNoRemindersMessage() {
        const content = document.getElementById('reminders-content');
        let html = '<div class="text-center no-reminders">'
        html += '<em>There are no reminders to display</em>';
        html += '</div>';
        content.innerHTML = html;
    }

    function addRemindersList(reminders) {
        const content = document.getElementById('reminders-content');
        content.innerHTML = '';
        const ul = document.createElement('ul');
        ul.setAttribute('class', 'list-group');
        ul.setAttribute('id', 'reminders-list');
        reminders.forEach(reminder => addReminderItem(ul, reminder));
        content.appendChild(ul);
    }

    function updateReminders(reminders) {
        if (reminders.length === 0) {
            showNoRemindersMessage();
        } else {
            addRemindersList(reminders);
            addDeleteReminderEvents();
        }
    }

    function addDeleteReminderEvents() {
        const links = document.getElementsByClassName('delete-reminder');
        for (const link of links) {
            link.addEventListener('click', deleteReminder);
        }
    }

    function removeReminderFromList(link) {
        // parent: col.row.li
        const li = link.parentNode.parentNode.parentNode;
        const ul = document.getElementById('reminders-list');
        ul.removeChild(li);
    }

    async function deleteReminder(event) {
        event.preventDefault();
        if (confirm('Delete reminder?')) {
            const link = event.currentTarget;
            const id = link.getAttribute('data-id');
            await repository.deleteReminder(currentUser.token, id);
            removeReminderFromList(link);
        }
    }

    function getActiveTab() {
        if (location.hash && location.hash === '#active' || location.hash === '#all') {
            return location.hash.substring(1);
        } else {
            return 'active'; // default
        }
    }

    // adds active class to tab so it displays correctly
    function activateTab(activeTab) {
        const activeTabLink = document.getElementById('active-tab-link');
        const allTabLink = document.getElementById('all-tab-link');
        if (activeTab == 'active') {
            activeTabLink.classList.add('active');
            allTabLink.classList.remove('active');
        } else if (activeTab == 'all') {
            allTabLink.classList.add('active');
            activeTabLink.classList.remove('active');
        }
        util.hideMessage();
    }

    function filterActiveReminders(reminders) {
        const now = new Date().getTime();
        return reminders.filter(reminder => {
            return reminder.dateObj.getTime() > now;
        });
    }

    function updatePage(reminders) {
        const activeTab = getActiveTab();
        if (activeTab === 'active') {
            reminders = filterActiveReminders(reminders);
        }
        updateReminders(reminders);
        activateTab(activeTab);
    }

    async function loadReminders() {
        return repository.getReminders(currentUser)
            .then(updatePage)
            .catch(console.log);
    }

    async function loadPage() {
        const user = await dataStore.getUser();
        if (user) {
            currentUser = user;
            await loadReminders();
            window.onhashchange = loadReminders;
        } else {
            location.href = '/login';
        }
    }

    util.start().then(loadPage);
}());
