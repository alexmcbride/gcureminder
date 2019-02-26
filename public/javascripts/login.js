/*
 * Module to handle login page
 */
(function () {
    function login(user) {
        function redirect() {
            location.href = '/';
        }

        // todo: subscription check should happen every page not on login
        dataStore.setUser(user).then(user => {
            if (user.subscription) {
                redirect();
            }
            else {
                notifications.subscribe(user).then(response => {
                    if (response.status === 201) {
                        user.subscription = true;
                        dataStore.clearUsers();
                        dataStore.setUser(user);
                        redirect();
                    } else {
                        console.log('Status: ' + response.status);
                    }
                }).catch(console.log);
            }
        });
    }

    function getLoginData() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        if (username.length === 0 || password.length === 0) {
            return null;
        } else {
            return { username: username, password: password };
        }
    }

    function onLogin(event) {
        event.preventDefault();
        const data = getLoginData();
        if (data) {
            util.postJson('api/users/login', data).then(result => {
                if (result.success) {
                    login(result.user);
                } else {
                    util.showMessage('Username or password incorrect');
                }
            }).catch(console.log);
        } else {
            util.showMessage('Enter username and password');
        }
    }

    util.start().then(() => {
        document.getElementById('login-form').addEventListener('submit', onLogin);
    });
}());