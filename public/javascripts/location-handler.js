/*
 * Module to handle the geofence. It watches for the user to move within a certain distance of the latlon, then 
 * updates a flag in storage and on the server. The server uses this to determine what sort of notification to
 * send.
 */
const locationManager = (function () {
    let currentUser = null;

    // c/o: https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
    function getDistanceFromLatLonInMetres(lat1, lon1, lat2, lon2) {
        function deg2rad(deg) {
            return deg * (Math.PI / 180)
        }
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d * 1000; // Convert to metres
    }

    async function locationUpdate(pos) {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const distance = getDistanceFromLatLonInMetres(lat, lon, currentUser.latitude, currentUser.longitude);
        const atLocation = currentUser.distance > distance;
        if (currentUser.atLocation !== atLocation) {
            await repository.editAtLocation(currentUser.token, atLocation);
        }
    }

    function locationError(err) {
        console.log('Location error: ' + err);
    }

    function startLocationUpdates() {
        dataStore.init().then(() => {
            return dataStore.getUser();
        }).then(user => {
            if (user) {
                currentUser = user;
                navigator.geolocation.watchPosition(locationUpdate, locationError, {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 0
                });
            }
        });
    }

    app.documentLoaded().then(startLocationUpdates);
}());