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
                app.showMessage('Saved reminder!');
                clearForm();
            });
        }
    }

    class EditReminderState {
        constructor(id) {
            this.id = id;
            repository.getReminder(currentUser, this.id).then(this.updateForm).catch(error => {
                console.log('Fresh load failed: ' + error);
            });
            setMinimumDate();
        }

        updateForm(data) {
            document.getElementById('title').value = data.title;
            document.getElementById('type').value = data.type;
            document.getElementById('room').value = data.room;
            document.getElementById('date').value = app.formatDate(data.date);
            document.getElementById('duration').value = data.duration;
            document.getElementById('reminder-form').style.display = 'block';
        }

        save() {
            // save existing reminder
            const data = getData();
            data.id = this.id;
            data.userId = currentUser._id;
            return repository.editReminder(currentUser.token, data).then(response => {
                app.showMessage('Saved reminder!');
            });
        }
    }

    let currentUser = null;
    let state = null;

    function setMinimumDate() {
        document.getElementById('date').setAttribute('min', app.formatDate(new Date()));
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
        const fields = ['title', 'type', 'room', 'date', 'duration'];
        return fields.every(f => document.getElementById(f).checkValidity());
    }

    async function onSaveClick(event) {
        disableSaveButton(true);
        event.preventDefault();
        if (checkValidity()) {
            await state.save();
        } else {
            app.showMessage('Validation errors!');
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

    app.start().then(onPageLoaded);
}());
