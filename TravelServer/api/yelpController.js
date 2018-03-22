'use strict';

const yelp = require('yelp-fusion');
const apiKey = "iqflw7h04ON6nqY5tIiMxaBxBtA2Kw0ll5KdDG70mYADWrXIyTYFFPh7JzlH06krWhAdOYPLyufCzofgU0En9wCOpsy6of4FxtzwzjH53eTUXzgtrqDHVaUI9aGyWnYx";
const client = yelp.client(apiKey);

//endpoint yelpReviews
exports.getYelpReviews = function (request, response) {
    console.log("Request:",request.query);
    var yelpBestMatchJson=getBusinessMatch(request.query,function(bestMatchJson){
        console.log("bestMatch output:",bestMatchJson.businesses[0].id);//.jsonBody.businesses[0].id
        //call reviews
        client.reviews(bestMatchJson.businesses[0].id).then(reviewResponse => {
            console.log("Reviews:",reviewResponse.jsonBody.reviews);
            response.send(reviewResponse.jsonBody.reviews);
          }).catch(e => {
            console.log(e);
          });
        
    });
    //console.log("yelpBestMatchJson"+yelpBestMatchJson);
    

};

// matchType can be 'lookup' or 'best'
function getBusinessMatch(incomingRequest,callback) {
    client.businessMatch('best', {
        name: incomingRequest.name,
        address1: incomingRequest.address1,        
        city: incomingRequest.city,
        state: incomingRequest.state,
        country: incomingRequest.country,
        latitude:incomingRequest.latitude,
        longitude:incomingRequest.longitude
    }).then(response => {
        //console.log(response.jsonBody.businesses[0].id);
        return callback(response.jsonBody);
    }).catch(e => {
        console.log(e);
    });
    
}