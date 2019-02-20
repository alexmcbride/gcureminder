/*
 * Module with some utility functions.
 */
const util = (function () {
    function documentLoaded() {
        return new Promise((resolve, reject) => {
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", resolve);
            } else {
                resolve();
            }
        });
    };

    function showMessage(message) {
        const el = document.getElementById('message');
        el.innerHTML = message;
        el.style.display = 'block';
    };

    function padNumber(num) {
        return num >= 0 && num <= 9 ? '0' + num : '' + num;
    }

    function formatDate(dateStr) {
        // Format date as: yyyy-MM-ddThh:mm
        const date = new Date(dateStr);
        const month = padNumber(date.getMonth() + 1);
        const day = padNumber(date.getDate());
        const hours = padNumber(date.getHours());
        const minutes = padNumber(date.getMinutes());
        return date.getFullYear() + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
    }

    function initServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                // Registration was successful
                // console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });
        }
    }

    function offline() {
        return !window.navigator.onLine;
    }

    function online() {
        return window.navigator.onLine;
    }

    function fetchJson(url) {
        return new Promise((resolve, reject) => {
            return fetch(url).then(response => {
                if (response.status === 200) {
                    response.json().then(resolve);
                } else {
                    reject('Status ' + response.status);
                }
            });
        });
    }

    function postJson(url, data) {
        const options = {
            method: 'post',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };
        return new Promise((resolve, reject) => {
            fetch(url, options).then(response => {
                if (response.status === 200) {
                    response.json().then(resolve);
                } else {
                    reject('Status ' + response.status);
                }
            }).catch(reject);
        });
    }
    
    return {
        documentLoaded: documentLoaded,
        showMessage: showMessage,
        formatDate: formatDate,
        padNumber: padNumber,
        initServiceWorker: initServiceWorker,
        offline: offline,
        online: online,
        postJson: postJson,
        fetchJson: fetchJson
    }
}());