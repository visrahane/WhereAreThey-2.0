"use strict";
module.exports=function(app){
    var googleController=require("../api/googleController");
    var yelpController=require("../api/yelpController");
    //google routes
    app.route('/searchResults')
        .get(googleController.getSearchResults);
    app.route('/nextSearchResults')
        .get(googleController.getNextSearchResults);
    //yelp routes
    app.route('/yelpReviews')
        .get(yelpController.getYelpReviews);
};