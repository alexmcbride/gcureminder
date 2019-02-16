const dataStore = (function () {
    const version = 8;
    const name = 'honours-project-db';
    let db = null;

    function init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(name, version);

            request.onupgradeneeded = event => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users');
                }
            };

            request.onerror = event => {
                reject('Database error: ' + request.error);
            };

            request.onsuccess = event => {
                db = event.target.result;
                resolve();
            }
        });
    }

    function getUsers() {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['users'], 'readonly');
            transaction.onerror = event => {
                reject('DB error: ' + transaction.error);
            };
            const store = transaction.objectStore('users');
            const users = [];
            store.openCursor().onsuccess = event => {
                const cursor = event.target.result;
                if (cursor) {
                    users.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(users);
                }
            };
        });
    }

    function getUser() {
        return new Promise((resolve, reject) => {
            getUsers().then(users => {
                if (users.length > 0) {
                    resolve(users[0]);
                } else {
                    resolve(null);
                }
            }).catch(reject);
        });
    }

    function setUser(user) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['users'], 'readwrite');
            transaction.onerror = event => {
                reject('DB error: ' + transaction.error);
            }
            const store = transaction.objectStore('users');
            const request = store.put(user, user.token);
            request.onsuccess = event => {
                resolve(user);
            }
        });
    }

    function addUser(user) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['users'], 'readwrite');
            transaction.onerror = event => {
                reject('DB error: ' + transaction.error);
            }
            const store = transaction.objectStore('users');
            const request = store.add(user, user.token);
            request.onsuccess = event => {
                resolve(user);
            }
        });
    }

    function clearStorage() {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['users'], 'readwrite');
            transaction.onerror = event => {
                reject('DB error: ' + transaction.error);
            }
            const store = transaction.objectStore('users');
            const request = store.clear();
            request.onsuccess = event => {
                resolve();
            }
        });
    }

    function updateDistance(distance) {
        return new Promise((resolve, reject) => {
            getUser().then(user => {
                user.distance = distance;
                dataStore.setUser(user).then(user => {
                    resolve(user);
                }).catch(console.log);
            }).catch(reject);
        });
    }

    function updateLocation(lat, lon) {
        return new Promise((resolve, reject) => {
            getUser().then(user => {
                user.longitude = lon;
                user.latitude = lat;
                dataStore.setUser(user).then(user => {
                    resolve(user);
                }).catch(console.log);
            }).catch(reject);
        });
    }

    return {
        init: init,
        getUsers: getUsers,
        getUser: getUser,
        addUser: addUser,
        setUser: setUser,
        clearStorage: clearStorage,
        updateDistance: updateDistance,
        updateLocation: updateLocation
    }
}());