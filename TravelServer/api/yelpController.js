'use strict';

const yelp = require('yelp-fusion');
const apiKey = "iqflw7h04ON6nqY5tIiMxaBxBtA2Kw0ll5KdDG70mYADWrXIyTYFFPh7JzlH06krWhAdOYPLyufCzofgU0En9wCOpsy6of4FxtzwzjH53eTUXzgtrqDHVaUI9aGyWnYx";
const client = yelp.client(apiKey);

//endpoint yelpReviews
exports.getYelpReviews = function (request, response) {
    console.log(request.query);
    var yelpBestMatchJson=getBusinessMatch(function(bestMatchJson){
        console.log(bestMatchJson.businesses[0].id);//.jsonBody.businesses[0].id
        //call reviews
        client.reviews(bestMatchJson.businesses[0].id).then(reviewResponse => {
            console.log(reviewResponse.jsonBody.reviews);
            response.send(reviewResponse.jsonBody.reviews);
          }).catch(e => {
            console.log(e);
          });
        
    });
    //console.log("yelpBestMatchJson"+yelpBestMatchJson);
    

};

// matchType can be 'lookup' or 'best'
function getBusinessMatch(callback) {
    client.businessMatch('best', {
        name: 'Pannikin Coffee & Tea',
        address1: '510 N Coast Hwy 101',
        address2: 'Encinitas, CA 92024',
        city: 'Encinitas',
        state: 'CA',
        country: 'US'
    }).then(response => {
        console.log(response.jsonBody.businesses[0].id);
        return callback(response.jsonBody);
    }).catch(e => {
        console.log(e);
    });
    
}