/*
 * Module to wrap indexed db.
 */
const dataStore = (function () {
    const version = 11;
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
                createObjectStores(db, ['users', 'reminders', 'sync-queue']);
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

    function getObjectStore(name, mode, reject) {
        const transaction = db.transaction([name], mode);
        transaction.onerror = event => {
            reject('DB error: ' + transaction.error);
        };
        return transaction.objectStore(name);
    }

    function getCollection(name) {
        return new Promise((resolve, reject) => {
            const store = getObjectStore(name, 'readonly', reject);
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
            const store = getObjectStore(name, 'readwrite', reject);
            const request = store.add(data, id);
            request.onsuccess = event => {
                resolve(data);
            }
        });
    }

    function setDocument(name, data, id) {
        return new Promise((resolve, reject) => {
            const store = getObjectStore(name, 'readwrite', reject);
            const request = store.put(data, id);
            request.onsuccess = event => {
                resolve(data);
            }
        });
    }

    function getDocument(name, id) {
        return new Promise((resolve, reject) => {
            const store = getObjectStore(name, 'readonly', reject);
            const request = store.get(id);
            request.onsuccess = event => {
                resolve(request.result);
            }
        });
    }

    function deleteDocument(name, id) {
        return new Promise((resolve, reject) => {
            const store = getObjectStore(name, 'readwrite', reject);
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
            const store = getObjectStore(name, 'readwrite', reject);
            const request = store.clear();
            request.onsuccess = event => {
                resolve();
            }
        });
    }

    function editDistance(distance) {
        return new Promise((resolve, reject) => {
            getUser().then(user => {
                user.distance = distance;
                setUser(user).then(user => {
                    resolve(user);
                }).catch(console.log);
            }).catch(reject);
        });
    }

    function editLocation(lattiude, longitude) {
        return new Promise((resolve, reject) => {
            getUser().then(user => {
                user.longitude = longitude;
                user.latitude = lattiude;
                setUser(user).then(user => {
                    resolve(user);
                }).catch(console.log);
            }).catch(reject);
        });
    }

    function addReminders(reminders) {
        return new Promise((resolve, reject) => {
            const promises = reminders.map(addReminder);
            Promise.all(promises).then(resolve).catch(reject);
        });
    }

    function getReminders() {
        return getCollection('reminders');
    }

    function getReminder(id) {
        return getDocument('reminders', id);
    }

    function createReminder(reminder) {
        reminder.id = createTempId();
        return addDocument('reminders', reminder, reminder.id);
    }

    function addReminder(reminder) {
        return addDocument('reminders', reminder, reminder.id);
    }

    function setReminder(reminder) {
        return setDocument('reminders', reminder, reminder.id);
    }

    function deleteReminder(id) {
        return deleteDocument('reminders', id);
    }

    function createTempId() {
        return crypto.getRandomValues(new Uint32Array(4)).join('-');
    }

    function addSyncItem(token, data, url) {
        const id = createTempId();
        const document = { id: id, url: url, token: token, data: data };
        return setDocument('sync-queue', document, id);
    }

    function getSyncItems() {
        return getCollection('sync-queue');
    }

    function deleteSyncItem(id) {
        return deleteDocument('sync-queue', id);
    }

    return {
        init: init,
        getUsers: getUsers,
        getUser: getUser,
        addUser: addUser,
        setUser: setUser,
        clearStorage: clearStorage,
        editDistance: editDistance,
        editLocation: editLocation,
        addReminders: addReminders,
        getReminders: getReminders,
        getReminder: getReminder,
        createReminder: createReminder,
        addReminder: addReminder,
        setReminder: setReminder,
        deleteReminder: deleteReminder,
        addSyncItem: addSyncItem,
        getSyncItems: getSyncItems,
        deleteSyncItem: deleteSyncItem
    }
}());
