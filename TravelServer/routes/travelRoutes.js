"use strict";
module.exports=function(app){
    var googleController=require("../api/googleController");
    var yelpController=require("../api/yelpController");
    //google routes
    app.route('/searchResults')
        .get(googleController.getSearchResults);
    //yelp routes
    app.route('/yelpReviews')
        .get(yelpController.getYelpReviews);
};