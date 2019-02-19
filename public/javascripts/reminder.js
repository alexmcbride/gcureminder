/*
 * Module to handle reminder add/edit page
 */
(function () {
    class AddReminderState {
        init() { 
            document.getElementById('reminder-form').style.display = 'block';
        }

        save() {
            const data = getData();
            json.addReminder(currentUser.token, data).then(response => {
                if (response.success) {
                    util.showMessage('Reminder successfully saved!');
                    clearForm();
                }
            }).catch(console.log);
        }
    }

    class EditReminderState {
        constructor(id) {
            this.id = id;
        }

        init() {
            // load reminder from API
            json.getReminder(currentUser.token, this.id)
                .then(EditReminderState.updateForm)
                .catch(console.log);
        }

        static updateForm(data) {
            document.getElementById('title').value = data.title;
            document.getElementById('type').value = data.type;
            document.getElementById('room').value = data.room;
            document.getElementById('date').value = util.formatDate(data.date);
            document.getElementById('duration').value = data.duration;
            document.getElementById('reminder-form').style.display = 'block';
        }

        save() {
            // save existing reminder
            const data = getData();
            data._id = this.id;
            json.editReminder(currentUser.token, data).then(response => {
                if (response.success) {
                    util.showMessage('Reminder successfully saved!');
                }
            }).catch(console.log);
        }
    }

    let currentUser = null;
    let state = null;

    function clearForm() {
        document.getElementById('title').value = '';
        document.getElementById('type').value = '';
        document.getElementById('room').value = '';
        document.getElementById('date').value = '';
        document.getElementById('duration').value = '';
    }

    function getData() {
        const date = new Date(document.getElementById('date').value);
        return {
            userId: currentUser._id,
            title: document.getElementById('title').value,
            type: document.getElementById('type').value,
            room: document.getElementById('room').value,
            date: date.toISOString(),
            duration: document.getElementById('duration').value,
        };
    }

    function getStateFromHash() {
        // hash takes form 'edit/1234'
        if (location.hash) {
            const tokens = location.hash.split('/');
            if (tokens.length === 2 && tokens[0] === '#edit') {
                return new EditReminderState(tokens[1]);
            } else {
                console.log('Error: bad hash');
            }
        }
        return new AddReminderState();
    }

    function checkValidity() {
        return document.getElementById('title').checkValidity() &&
            document.getElementById('type').checkValidity() &&
            document.getElementById('room').checkValidity() &&
            document.getElementById('date').checkValidity() &&
            document.getElementById('duration').checkValidity();
    }

    function onSaveClick(event) {
        event.preventDefault();
        if (checkValidity()) {
            state.save();
        } else {
            util.showMessage('Validation errors!');
        }
    }

    function onPageLoaded() {
        util.initServiceWorker();

        dataStore.init().then(() => {
            dataStore.getUser().then(user => {
                if (user) {
                    currentUser = user;
                    state = getStateFromHash();
                    state.init();
                    document.getElementById('reminder-form').addEventListener('submit', onSaveClick);
                } else {
                    location.href = '/login';
                }
            });
        });
    }

    util.documentLoaded().then(onPageLoaded);
}());
