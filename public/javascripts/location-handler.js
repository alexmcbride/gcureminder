const locationManager = (function () {

    // c/o: https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
    function getDistanceFromLatLonInMetres(lat1, lon1, lat2, lon2) {
        function deg2rad(deg) {
            return deg * (Math.PI / 180)
        }
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d * 1000; // Metres
    }

    function locationUpdate(pos) {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        checkDistance(lat, lon);
    }

    function checkDistance(lat, lon) {
        // todo: maybe update user with curr lat/lon and then do sync request?
        dataStore.init().then(() => {
            dataStore.getUser().then(user => {
                const distance = getDistanceFromLatLonInMetres(lat, lon, user.latitude, user.longitude);
                if (user.distance > distance) {
                    repository.editAtLocation(user.token, true);
                    console.log('At location');
                } else {
                    console.log('Not at location');
                    repository.editAtLocation(user.token, false);
                }
            });
        });
    }

    function startLocationUpdates() {
        // navigator.geolocation.getCurrentPosition(locationUpdate);

        //https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition
        navigator.geolocation.watchPosition(locationUpdate, console.log, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0
        });
    }

    util.documentLoaded().then(startLocationUpdates);
}());