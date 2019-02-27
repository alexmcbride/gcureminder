/*
 * Module to handle reminder add/edit page
 */
(function () {
    class AddReminderState {
        constructor() {
            document.getElementById('reminder-form').style.display = 'block';
            setMinimumDate();
        }

        save() {
            const data = getData();
            return repository.addReminder(currentUser.token, data).then(() => {
                util.showMessage('Reminder saved!');
                clearForm();
            });
        }
    }

    class EditReminderState {
        constructor(id) {
            this.id = id;
            repository.getReminder(currentUser.token, this.id)
                .then(this.updateForm)
                .catch(console.log);
            setMinimumDate();
        }

        updateForm(data) {
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
            data.id = this.id;
            return repository.editReminder(currentUser.token, data).then(response => {
                util.showMessage('Reminder saved!');
            });
        }
    }

    let currentUser = null;
    let state = null;

    function setMinimumDate() {
        document.getElementById('date').setAttribute('min', util.formatDate(new Date()));
    }

    function disableSaveButton(disabled) {
        document.getElementById('save-button').disabled = disabled;
    }

    function clearForm() {
        document.getElementById('title').value = '';
        document.getElementById('type').value = 'Lecture';
        document.getElementById('room').value = '';
        document.getElementById('date').value = '';
        document.getElementById('duration').value = '60';
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
                const id = tokens[1];
                return new EditReminderState(id);
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

    async function onSaveClick(event) {
        disableSaveButton(true);
        event.preventDefault();
        if (checkValidity()) {
            await state.save();
        } else {
            util.showMessage('Validation errors!');
        }
        disableSaveButton(false);
    }

    function onPageLoaded() {
        dataStore.getUser().then(user => {
            if (user) {
                currentUser = user;
                state = getStateFromHash();
                document.getElementById('reminder-form').addEventListener('submit', onSaveClick);
            } else {
                location.href = '/login';
            }
        });
    }

    util.start().then(onPageLoaded);
}());
