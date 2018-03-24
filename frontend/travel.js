var app=angular.module("loadApp", []);
app.controller("locController",function($scope,$http){
    $http({
        method:"GET",
        url:"http://ip-api.com/json"
    }).then(function mySuccess(response){
       // var locationJson=JSON.parse(response);
        latitude=response.data.lat;
        longitude=response.data.lon
        console.log(response.data.lon);
        console.log(response.data.lat);
    },function myError(response){
        console.log("Error:",response);
    });

    $scope.submitFormData=function(){
        $http({
            method:"GET",
            url:"http://webtechtravel-env.us-east-2.elasticbeanstalk.com/searchResults",
            params:{category:"default",
                distance:"10",
                keyword:"pizza",
                latitude:latitude,
                longitude:longitude,
                location:"new york"
            }
        }).then(function mySuccess(response){
           // var locationJson=JSON.parse(response);
            console.log(response.data);
            $scope.results = response.data.results;
            //createResultsTable(response.data);
        },function myError(response){
            console.log("Error:",response);
        });
    };

    function createResultsTable(tableData){

    }
});

var autocomplete;
function initAutocomplete() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    autocomplete = new google.maps.places.Autocomplete(
              /** @type {!HTMLInputElement} */(document.getElementById('locationOther')),
        { types: ['geocode'] });

}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
        });
    }
}