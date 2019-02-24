/*
 * Module to handle login page
 */
(function () {
    function login(user) {
        dataStore.init().then(() => {
            dataStore.setUser(user).then(user => {
                location.href = '/';
            });
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