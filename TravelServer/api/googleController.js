const httpRequest = require("request");
const GOOGLE_GEOCODING_API = "https://maps.googleapis.com/maps/api/geocode/json";
const GOOGLE_KEY = "AIzaSyDWBtO4XwwiZCwCDr6z2aK8rXZMuO0OTNM";
const GOOGLE_NEARBY_SEARCH_API = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const GOOGLE_PLACES_DETAILS_API = "https://maps.googleapis.com/maps/api/place/details/json";
const GOOGLE_PLACES_PHOTO_API = "https://maps.googleapis.com/maps/api/place/photo";

exports.getSearchResults = function (request, response) {
    console.log("Request to the api:",request.query);
    if (request.query.location == "" || request.query.location != "here") {
        getGeoLocation(request.query, function (geoLocationJson) {
            //console.log(geoLocationJson);
            request.query.latitude = geoLocationJson["results"][0]["geometry"]["location"]["lat"];
            request.query.longitude = geoLocationJson["results"][0]["geometry"]["location"]["lng"];
            var queryObj=prepareQueryObj(request.query);
            callGooglePlaces(queryObj, function (googlePlacesJson) {
                console.log("Api Response:",googlePlacesJson);
                response.send(googlePlacesJson);
            });
        });
    }else{
        var queryObj=prepareQueryObj(request.query);
        callGooglePlaces(queryObj, function (googlePlacesJson) {
                console.log("Api Response:",googlePlacesJson);
                response.send(googlePlacesJson);
        });
    }
 
};
//get next search api
exports.getNextSearchResults=function(request,response){
    var query={
        key: GOOGLE_KEY,
        pagetoken: request.query.nextPageToken
    }
    callGooglePlaces(query,function(googlePlacesJson){
        console.log(googlePlacesJson);
        response.send(googlePlacesJson);
    });
};
function prepareQueryObj(query){
    var queryObj = {
        location: query.latitude + "," + query.longitude,
        key: GOOGLE_KEY, 
        radius:query.distance * 1609.34,
        type:query.category,
        keyword:query.keyword
    };
    return queryObj;
}
function callGooglePlaces(query, callback) {
    console.log("googleCall-",query);       
    httpRequest.get({ url: GOOGLE_NEARBY_SEARCH_API, qs: query }, (error, response, body) => {
        var googlePlacesJson = JSON.parse(body);
        return callback(googlePlacesJson);
    });
}

function getGeoLocation(query, callback) {
    var queryObject = { address: query.location, key: GOOGLE_KEY };
    console.log("GetGeoLocationParam:",queryObject);
    httpRequest.get({ url: GOOGLE_GEOCODING_API, qs: queryObject }, (error, response, body) => {
        var geoLocationJson = JSON.parse(body);
        return callback(geoLocationJson);
    });
}