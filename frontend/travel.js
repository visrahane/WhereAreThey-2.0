var app=angular.module("loadApp", []);
app.controller("locController",function($scope,$http){
    $scope.nextPageUrl={};
    $http({
        method:"GET",
        url:"http://ip-api.com/json"
    }).then(function mySuccess(response){
       // var locationJson=JSON.parse(response);
        latitude=response.data.lat;
        longitude=response.data.lon;
        $scope.disableSearchBtn=false;
        console.log(response.data.lon);
        console.log(response.data.lat);
    },function myError(response){
        console.log("Error:",response);
    });

    $scope.submitFormData=function(){
        if(!$scope.distance){
            $scope.distance=10;
        }
        var location;
        if(!$scope.location){
            location="here";
        }else{
            location=$scope.location;
        }
        console.log("location",location);
        if(autocomplete.getPlace()){
            $scope.location=autocomplete.getPlace().formatted_address;
        }
        $http({
            method:"GET",
            url:"http://webtechtravel-env.us-east-2.elasticbeanstalk.com/searchResults",
            params:{category:$scope.category,
                distance:$scope.distance,
                keyword:$scope.keyword,
                latitude:latitude,
                longitude:longitude,
                location:location
            }
        }).then(function mySuccess(response){
           // var locationJson=JSON.parse(response);
            console.log(response.data);
            $scope.results = response.data.results;
            toggleVisibility("detailsBtnId");
            if(response.data.next_page_token!=null && response.data.next_page_token!=""){
                //set nextPageToken in nextBtn 
                toggleVisibility("nextBtn");
                $scope.nextPageUrl=response.data.next_page_token;
                //and button should call api when clicked with param nextPageToken

            }
        },function myError(response){
            console.log("Error:",response);
        });
    };
    $scope.fetchNext=function (){
        toggleVisibility("nextBtn");
        console.log($scope.nextPageUrl);
        $http({
            method:"GET",
            url:"http://webtechtravel-env.us-east-2.elasticbeanstalk.com/nextSearchResults",
            params:{nextPageToken:$scope.nextPageUrl
            }
        }).then(function mySuccess(response){
           // var locationJson=JSON.parse(response);
            console.log(response.data);
            $scope.results = response.data.results;
            if(response.data.next_page_token!=null && response.data.next_page_token!=""){
                //set nextPageToken in nextBtn 
                toggleVisibility("nextBtn");
                $scope.nextPageUrl=response.data.next_page_token;
                //and button should call api when clicked with param nextPageToken

            }
        },function myError(response){
            console.log("Error:",response);
        });
        
    }
    
    function toggleVisibility(divId) {
        $("#" + divId).toggle();
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

