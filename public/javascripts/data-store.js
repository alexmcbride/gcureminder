/*
 * Module to wrap indexed db.
 */
const dataStore = (function () {
    const version = 14;
    const name = 'gcu-reminders-db';
    let db = null;

    function createObjectStores(db, names) {
        names.forEach(async name => {
            if (db.objectStoreNames.contains(name)) {
                await clearStorage(name);
            } else {
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
        if (db == null) {
            throw 'DB not initialized!';
        }
        const transaction = db.transaction([name], mode);
        transaction.onerror = event => {
            reject('DB transaction error: ' + transaction.error);
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

    function clearStorage(name) {
        return new Promise((resolve, reject) => {
            const store = getObjectStore(name, 'readwrite', reject);
            const request = store.clear();
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
        if (user.subscription === undefined) {
            user.subscription = false;
        }
        return setDocument('users', user, user.token);
    }

    function clearUsers() {
        return clearStorage('users');
    }

    function editDistance(distance) {
        return getUser().then(user => {
            user.distance = distance;
            return setUser(user);
        });
    }

    function editLocation(lattiude, longitude) {
        return getUser().then(user => {
            user.longitude = longitude;
            user.latitude = lattiude;
            return setUser(user);
        });
    }

    function editAtLocation(atLocation) {
        return getUser().then(user => {
            user.atLocation = atLocation;
            return setUser(user);
        });
    }

    function sortRemindersByTime(a, b) {
        const timeA = a.dateObj.getTime();
        const timeB = b.dateObj.getTime();
        if (timeA > timeB) {
            return 1;
        } else if (timeA < timeB) {
            return -1;
        } else {
            return 0;
        }
    }

    function getReminders(userId) {
        return new Promise((resolve, reject) => {
            getCollection('reminders').then(reminders => {
                const filtered = reminders.filter(reminder => reminder.userId === userId);
                filtered.sort(sortRemindersByTime);
                resolve(filtered);
            }).catch(reject);
        });
    }

    function getReminder(id) {
        return getDocument('reminders', id);
    }

    function setReminders(reminders) {
        const promises = reminders.map(setReminder);
        return Promise.all(promises);
    }

    function setReminder(reminder) {
        // Add any missing properties if needed
        if (reminder.id === undefined) {
            reminder.id = createRandomId();
        }
        if (reminder.dateObj === undefined) {
            reminder.dateObj = new Date(reminder.date);
        }
        return setDocument('reminders', reminder, reminder.id);
    }

    function deleteReminder(id) {
        return deleteDocument('reminders', id);
    }

    function createRandomId() {
        return crypto.getRandomValues(new Uint32Array(4)).join('-');
    }

    function addSyncItem(token, data, url) {
        const id = createRandomId();
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
        setUser: setUser,
        clearUsers: clearUsers,
        editDistance: editDistance,
        editLocation: editLocation,
        editAtLocation: editAtLocation,
        getReminders: getReminders,
        getReminder: getReminder,
        setReminder: setReminder,
        setReminders: setReminders,
        deleteReminder: deleteReminder,
        addSyncItem: addSyncItem,
        getSyncItems: getSyncItems,
        deleteSyncItem: deleteSyncItem
    }
}());
