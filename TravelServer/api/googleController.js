const httpRequest = require("request");
const GOOGLE_GEOCODING_API = "https://maps.googleapis.com/maps/api/geocode/json";
const GOOGLE_KEY = "AIzaSyDWBtO4XwwiZCwCDr6z2aK8rXZMuO0OTNM";
const GOOGLE_NEARBY_SEARCH_API = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const GOOGLE_PLACES_DETAILS_API = "https://maps.googleapis.com/maps/api/place/details/json";
const GOOGLE_PLACES_PHOTO_API = "https://maps.googleapis.com/maps/api/place/photo";

exports.getSearchResults = function (request, response) {
    console.log(request.query);
    if (request.query.location == "" || request.query.location != "here") {
        getGeoLocation(request.query, function (geoLocationJson) {
            //console.log(geoLocationJson);
            request.query.latitude = geoLocationJson["results"][0]["geometry"]["location"]["lat"];
            request.query.longitude = geoLocationJson["results"][0]["geometry"]["location"]["lng"];
        });
    }
    callGooglePlaces(request.query, function (googlePlacesJson) {
        console.log(googlePlacesJson);
        response.send(googlePlacesJson);
    });
    
};

function callGooglePlaces(query, callback) {
    var queryObject = {
        location: query.latitude + "," + query.longitude,
        key: GOOGLE_KEY, radius:query.distance * 1609.34, type:query.category, keyword:query.keyword
    };
    console.log(queryObject);
    httpRequest.get({ url: GOOGLE_NEARBY_SEARCH_API, qs: queryObject }, (error, response, body) => {
        var googlePlacesJson = JSON.parse(body);
        return callback(googlePlacesJson);
    });
}

function getGeoLocation(query, callback) {
    var queryObject = { address: query.location, key: GOOGLE_KEY };
    console.log(queryObject);
    httpRequest.get({ url: GOOGLE_GEOCODING_API, qs: queryObject }, (error, response, body) => {
        var geoLocationJson = JSON.parse(body);
        return callback(geoLocationJson);
    });
}