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
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        if (email.length === 0 || password.length === 0) {
            util.showMessage('Enter email and password');
            return null;
        } else {
            return { email: email, password: password };
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
                    util.showMessage('Email or password incorrect');
                }
            }).catch(console.log);
        }
    }

    util.documentLoaded().then(() => {
        document.getElementById('login-form').addEventListener('submit', onLogin);
    });
}());