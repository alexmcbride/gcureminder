/*
 * Module to handle settings page
 */
const settings = (function () {
    let currentUser = null;
    let map = null;
    let marker = null;

    function onDistanceChanged() {
        const distance = parseInt(document.getElementById('distance').value);
        saveDistance(distance);
    }

    function enableUi() {
        document.getElementById('distance').setAttribute('enabled', true);
        if (marker != null) {
            marker.setDraggable(true);
        }
    }

    function disableUi() {
        document.getElementById('distance').setAttribute('enabled', false);
        if (marker != null) {
            marker.setDraggable(false);
        }
    }

    function saveDistance(distance) {
        disableUi();
        repository.editDistance(currentUser.token, distance).then(response => {
            enableUi();
        }).catch(console.log);
    }

    function saveLocation(latitude, longitude) {
        disableUi();
        repository.editLocation(currentUser.token, latitude, longitude).then(response => {
            enableUi();
        }).catch(console.log);
    }

    function onLogout() {
        fetch('/api/users/logout', {
            method: 'post',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: currentUser.token }),
        }).then(response => {
            if (response.ok) {
                return dataStore.clearUsers().then(() => {
                    location.href = '/login';
                });
            } else {
                throw 'Logout status not OK';
            }
        }).catch(console.log);
    }

    function loadCurrentUser() {
        return new Promise((resolve, reject) => {
            if (currentUser == null) {
                dataStore.init().then(() => {
                    dataStore.getUser().then(user => {
                        if (user) {
                            currentUser = user;
                            resolve(user);
                        } else {
                            location.href = '/login';
                            reject();
                        }
                    }).catch(reject);
                });
            } else {
                resolve(currentUser);
            }
        });
    }

    function updateUploadLabel(text) {
        document.getElementById('upload-label').innerHTML = text;
    }

    function onFileUploadChange(event) {
        const file = event.currentTarget.value;
        if (file) {
            const tokens = file.split('\\');
            if (tokens.length > 0) {
                const name = tokens[tokens.length - 1];
                updateUploadLabel(name);
            }
        }
    }

    function onFileUploadSubmit(event) {
        event.preventDefault();

        // We use a form data object to upload our file.
        const formData = new FormData(event.currentTarget);
        formData.append('token', currentUser.token); // make sure we're authed

        // Upload file data, which returns added reminders as JSON. Add those to DB and 
        // display confirmation message.
        return fetch('/api/settings/upload', {
            method: 'POST',
            body: formData,
        }).then(response => {
            return response.json();
        }).then(reminders => {
            return repository.addReminders(reminders);
        }).then(reminders => {
            console.log('Import completed successfully');
            app.showMessage('Imported ' + reminders.length + ' reminders');
            updateUploadLabel('Choose file');
        }).catch(console.log);
    }

    function onPageLoaded() {
        loadCurrentUser().then(user => {
            if (user) {
                currentUser = user;
                document.getElementById('distance').value = user.distance;
                document.getElementById('distance').addEventListener('change', onDistanceChanged);
                document.getElementById('logout').addEventListener('click', onLogout);
                document.getElementById('upload-form').addEventListener('submit', onFileUploadSubmit);
                document.getElementById('upload').addEventListener('change', onFileUploadChange);
            } else {
                location.href = '/login';
            }
        }).catch(console.log);
    }

    function initMap() {
        loadCurrentUser().then(user => {
            const latLng = { lat: user.latitude, lng: user.longitude };

            map = new google.maps.Map(document.getElementById('map'), {
                center: latLng,
                zoom: 14
            });

            marker = new google.maps.Marker({ position: latLng, map: map, draggable: true, title: 'Location!' });

            google.maps.event.addListener(marker, 'dragend', function () {
                const location = marker.getPosition();
                saveLocation(location.lat(), location.lng());
            });
        }).catch(console.log);
    }

    app.start().then(onPageLoaded);

    return {
        initMap: initMap
    }
}());

function initMap() {
    // Calling this inside of module doesn't seem to work, so we do it like this.
    settings.initMap();
}