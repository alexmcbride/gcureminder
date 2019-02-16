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

    return {
        documentLoaded: documentLoaded,
        showMessage: showMessage,
        formatDate: formatDate,
        padNumber: padNumber
    }
}());