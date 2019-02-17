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

    function saveInternal(update, save) {
        disableUi();
        update().then(result => {
            if (result.success) {
                save().then(user => {
                    currentUser = user;
                    util.showMessage('Settings saved!');
                    enableUi();
                }).catch(console.log);
            } else {
                util.showMessage('Error: ' + result.error);
            }
        }).catch(console.log);
    }

    function saveDistance(distance) {
        saveInternal(() => json.updateDistance(currentUser.token, distance), 
            () => dataStore.updateDistance(distance));
    }

    function saveLocation(latitude, longitude) {
        saveInternal(() => json.updateLocation(currentUser.token, latitude, longitude), 
            () => dataStore.updateLocation(latitude, longitude));
    }

    function onLogout() {
        dataStore.clearStorage().then(() => {
            location.href = '/';
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
                }).catch(reject);
            } else {
                resolve(currentUser);
            }
        });
    }

    function onPageLoaded() {
        util.initServiceWorker();

        loadCurrentUser().then(user => {
            if (user) {
                currentUser = user;
                document.getElementById('distance').value = user.distance;
                document.getElementById('distance').addEventListener('change', onDistanceChanged);
                document.getElementById('logout').addEventListener('click', onLogout);
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

    util.documentLoaded().then(onPageLoaded);

    return {
        initMap: initMap
    }
}());

function initMap() {
    // Calling this inside of module doesn't seem to work, so we do it like this.
    settings.initMap();
}