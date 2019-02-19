/*
 * Module to wrap indexed db.
 */
const dataStore = (function () {
    const version = 10;
    const name = 'honours-project-db';
    let db = null;

    function createObjectStores(db, names) {
        names.forEach(name => {
            if (!db.objectStoreNames.contains(name)) {
                db.createObjectStore(name);
            }
        });
    }

    function init() {
        return new Promise((resolve, reject) => {
            if (db != null) {
                resolve(); // already initialized.
                return;
            }

            const request = indexedDB.open(name, version);

            request.onupgradeneeded = event => {
                const db = event.target.result;
                createObjectStores(db, ['users', 'reminders', 'pendingReminders']);
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

    function getCollection(name) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([name], 'readonly');
            transaction.onerror = event => {
                reject('DB error: ' + transaction.error);
            };
            const store = transaction.objectStore(name);
            const documents = [];
            store.openCursor().onsuccess = event => {
                const cursor = event.target.result;
                if (cursor) {
                    documents.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(documents);
                }
            };
        });
    }

    function addDocument(name, data, id) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([name], 'readwrite');
            transaction.onerror = event => {
                reject('DB error: ' + transaction.error);
            }
            const store = transaction.objectStore(name);
            const request = store.add(data, id);
            request.onsuccess = event => {
                resolve(data);
            }
        });
    }

    function setDocument(name, data, id) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([name], 'readwrite');
            transaction.onerror = event => {
                reject('DB error: ' + transaction.error);
            }
            const store = transaction.objectStore(name);
            const request = store.put(data, id);
            request.onsuccess = event => {
                resolve(data);
            }
        });
    }

    function getDocument(name, id) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([name], 'readonly');
            transaction.onerror = event => {
                reject('DB error: ' + transaction.error);
            }
            const store = transaction.objectStore(name);
            const request = store.get(id);
            request.onsuccess = event => {
                resolve(request.result);
            }
        });
    }

    function deleteDocument(name, id) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([name], 'readwrite');
            transaction.onerror = event => {
                reject('DB error: ' + transaction.error);
            }
            const store = transaction.objectStore(name);
            const request = store.delete(id);
            request.onsuccess = event => {
                resolve();
            }
        });
    }

    function getUsers() {
        return getCollection('users');
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
        return setDocument('users', user, user.token);
    }

    function addUser(user) {
        return addDocument('users', user, user.token);
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
                setUser(user).then(user => {
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
                setUser(user).then(user => {
                    resolve(user);
                }).catch(console.log);
            }).catch(reject);
        });
    }

    function addReminders(reminders) {
        return new Promise((resolve, reject) => {
            const promises = reminders.map(reminder => {
                return setDocument('reminders', reminder, reminder._id);
            });
            Promise.all(promises).then(resolve).catch(reject);
        });
    }

    function getReminders() {
        return getCollection('reminders');
    }

    function getReminder(id) {
        return getDocument('reminders', id);
    }

    function setReminder(reminder) {
        return setDocument('reminders', reminder, reminder._id);
    }

    function deleteReminder(id) {
        return deleteDocument('reminders', id);
    }

    function createTempId() {
        return crypto.getRandomValues(new Uint32Array(4)).join('-');
    }

    function addPendingReminder(token, reminder, type) {
        const id = createTempId();
        const data = { token: token, reminder: reminder, id: id, reminder: reminder, type: type };
        return setDocument('pendingReminders', data, id);
    }

    function getPendingReminders() {
        return getCollection('pendingReminders');
    }

    function deletePendingReminder(id) {
        return deleteDocument('pendingReminders', id);
    }

    return {
        init: init,
        getUsers: getUsers,
        getUser: getUser,
        addUser: addUser,
        setUser: setUser,
        clearStorage: clearStorage,
        updateDistance: updateDistance,
        updateLocation: updateLocation,
        addReminders: addReminders,
        getReminders: getReminders,
        getReminder: getReminder,
        setReminder: setReminder,
        deleteReminder: deleteReminder,
        addPendingReminder: addPendingReminder,
        getPendingReminders: getPendingReminders,
        deletePendingReminder: deletePendingReminder
    }
}());
