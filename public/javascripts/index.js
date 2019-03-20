/*
 * Module to handle the script for the index page.
 */
(function () {
    const tabPages = ['upcoming', 'all', 'previous', 'soon'];
    const defaultTab = 'soon';
    let currentUser = null;

    function getDate(date) {
        return util.padNumber(date.getDate()) + '/' +
            util.padNumber(date.getMonth() + 1) + '/' +
            date.getFullYear();
    }

    function getDuration(date, duration) {
        const start = (date.getHours() * 60) + date.getMinutes();
        const end = start + parseInt(duration);
        const startHours = Math.floor(start / 60);
        const startMinutes = start - (startHours * 60);
        const endHours = Math.floor(end / 60);
        const endMinutes = end - (endHours * 60);
        return startHours + ':' + util.padNumber(startMinutes) +
            ' - ' + endHours + ':' + util.padNumber(endMinutes);
    }

    function getRoom(room) {
        const max = 10;
        if (room.length > max) {
            return room.substring(0, max) + "...";
        }
        return room;
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

    function updateRemindersList(reminders) {
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
        if (location.hash && location.hash.length > 1) {
            const hash = location.hash.substr(1);
            if (tabPages.indexOf(hash) > -1) {
                return hash;
            }
        }
        return defaultTab;
    }

    function activateTab(activeTab) {
        tabPages.forEach(tab => {
            const tabLink = document.getElementById(tab + '-tab-link');
            if (tab === activeTab) {
                tabLink.classList.add('active');
            } else {
                tabLink.classList.remove('active');
            }
        });
        util.hideMessage();
    }

    function getRemindersPromise(activeTab) {
        if (activeTab === 'soon') {
            return repository.getNearReminders(currentUser);
        } else if (activeTab === 'upcoming') {
            return repository.getUpcomingReminders(currentUser);
        } else if (activeTab === 'previous') {
            return repository.getPreviousReminders(currentUser);
        } else {
            return repository.getReminders(currentUser);
        }
    }

    function updatePage() {
        const activeTab = getActiveTab();
        getRemindersPromise(activeTab).then(reminders => {
            updateRemindersList(reminders);
            activateTab(activeTab);
        }).catch(console.log);
    }

    async function loadPage() {
        const user = await dataStore.getUser();
        if (user) {
            currentUser = user;
            updatePage();
            window.onhashchange = updatePage;
        } else {
            location.href = '/login';
        }
    }

    util.start().then(loadPage);
}());
