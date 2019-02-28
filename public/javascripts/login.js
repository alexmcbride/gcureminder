/*
 * Module to handle login page
 */
(function () {
    async function login(user) {
        await dataStore.clearUsers();
        await dataStore.setUser(user);
        location.href = '/';
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
            fetch('/api/users/login', {
                method: 'post',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(response =>{
                return response.json();
            }).then(data => {
                if (data.success) {
                    login(data.user);
                } else {
                    util.showMessage('Username or password incorrect');
                }
            }).catch(console.log);;
        } else {
            util.showMessage('Enter username and password');
        }
    }

    util.start().then(() => {
        document.getElementById('login-form').addEventListener('submit', onLogin);
    });
}());