/*
http://csserver.usc.edu:45678/hw/hw8/images/Map.png
http://csserver.usc.edu:45678/hw/hw8/images/Pegman.png
http://csserver.usc.edu:45678/hw/hw8/images/Twitter.png
*/
var app = angular.module("loadApp", ["ngAnimate"]);
app.controller("locController", function ($scope, $http) {
    $scope.nextPageUrl = {};
    $scope.latitude;
    $scope.longitude;
    $scope.pages = [];
    $scope.details = {};
    $scope.fav=JSON.parse(localStorage.getItem("favList"));
    var currentPage = 0;
    $scope.map;
    $http({
        method: "GET",
        url: "http://ip-api.com/json"
    }).then(function mySuccess(response) {
        // var locationJson=JSON.parse(response);
        $scope.latitude = response.data.lat;
        $scope.longitude = response.data.lon;

        console.log(response.data.lon);
        console.log(response.data.lat);
    }, function myError(response) {
        console.log("Error:", response);
    });
    $scope.deleteFav=function(index){
        $scope.fav.pop($scope.fav[index]);
        localStorage.setItem("favList", JSON.stringify($scope.fav));
    }

    $scope.isFav=function(result){
        var favorite=false;
        angular.forEach($scope.fav,function(fav,index){
            if(result.place_id==fav.place_id){
                favorite=true;                
            }
        })
        return favorite;
    }
    $scope.saveToFav=function(index){
        //console.log("isFav-",$scope.fav.indexOf($scope.results[index]));
        if(!$scope.fav){
            $scope.fav=[];
        }          
        
        $scope.fav.push($scope.results[index]);
        localStorage.setItem("favList", JSON.stringify($scope.fav));
        //
        
    }
    $scope.submitFormData = function () {
        if (!$scope.distance) {
            $scope.distance = 10;
        }
        var location;

        if (autocomplete.getPlace()) {
            $scope.location = autocomplete.getPlace().formatted_address;
        }
        if (!$scope.location) {
            location = "here";
        } else {
            location = $scope.location;
        }
        //console.log("location", location);
        $http({
            method: "GET",
            url: "http://webtechtravel-env.us-east-2.elasticbeanstalk.com/searchResults",
            params: {
                category: $scope.category,
                distance: $scope.distance,
                keyword: $scope.keyword,
                latitude: $scope.latitude,
                longitude: $scope.longitude,
                location: location
            }
        }).then(function mySuccess(response) {
            // var locationJson=JSON.parse(response);
            //console.log(response.data);
            $scope.pages[currentPage++] = $scope.results = response.data.results;
            /*if ($scope.results.length == 0) {
                $scope.showNoRecordsBox = true;
            }*/
            if (response.data.next_page_token != null && response.data.next_page_token != "") {
                //set nextPageToken in nextBtn 
                toggleVisibility("nextBtn");
                $scope.nextPageUrl = response.data.next_page_token;
                //and button should call api when clicked with param nextPageToken
            }
            $scope.showProgressBar = false;
        }, function myError(response) {
            console.log("Error:", response);
            $scope.showErrorBox = true;
        });

    };
    $scope.fetchPrev = function () {
        $scope.results = $scope.pages[--currentPage];
        if (currentPage == 0) {
            toggleVisibility("prevBtn");
            toggleVisibility("nextBtn");
        }
        $scope.showProgressBar = false;
    }
    $scope.fetchNext = function () {
        toggleVisibility("nextBtn");
        toggleVisibility("prevBtn");
        if (!$scope.pages[currentPage]) {
            getNextPageFromServer();
        } else {
            $scope.results = $scope.pages[++currentPage];
            if (currentPage == $scope.pages.length) {
                currentPage--;
            }
        }
    }
    function getNextPageFromServer() {
        $http({
            method: "GET",
            url: "http://webtechtravel-env.us-east-2.elasticbeanstalk.com/nextSearchResults",
            params: {
                nextPageToken: $scope.nextPageUrl
            }
        }).then(function mySuccess(response) {
            // var locationJson=JSON.parse(response);            
            $scope.pages[currentPage] = $scope.results = response.data.results;
            if (response.data.next_page_token != null && response.data.next_page_token != "") {
                //set nextPageToken in nextBtn 
                toggleVisibility("nextBtn");
                $scope.nextPageUrl = response.data.next_page_token;
                currentPage++;

            }
            $scope.showProgressBar = false;
        }, function myError(response) {
            console.log("Error:", response);
            $scope.showErrorBox = true;
        });
    }

    $scope.initMap = function () {

        $scope.map = new google.maps.Map(document.getElementById('map'), {
            center: destLoc,
            zoom: 15
        });
        marker = new google.maps.Marker({
            position: destLoc,
            map: $scope.map
        });

        directionsService = new google.maps.DirectionsService;
        directionsDisplay = new google.maps.DirectionsRenderer;
        directionsDisplay.setMap($scope.map);

        //remove this
        //initStreetView();

    }
    var panorama;
    $scope.initStreetView = function () {
        panorama = new google.maps.StreetViewPanorama(
            document.getElementById('streetView'),
            {
                position: destLoc,
                pov: { heading: 165, pitch: 0 },
                zoom: 1
            });
        panorama.setVisible(true);

    }

    $scope.setImage = function () {
        //console.log(panorama);

        if ($scope.showStreetView) {
            $scope.mapBtnSrc = 'http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png';
        } else {
            $scope.mapBtnSrc = "http://cs-server.usc.edu:45678/hw/hw8/images/Map.png";
        }
    }

    $scope.setDest = function () {
        $scope.destinationLoc = $scope.details.formatted_address;
    }
    $scope.getDirections = function () {
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    }

    $scope.getDetails = function (result,index) {
        //init config
        console.log("resultObj",result);
        $scope.idSelectedResult=index;
        $scope.disableDetailsBtn=false;
        
        $scope.title = result.name;
        var request = {
            placeId: result.place_id
        };
        destLoc = {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng
        };

        $scope.map = new google.maps.Map(document.getElementById('map'), {
            center: destLoc,
            zoom: 7
        });

        var service = new google.maps.places.PlacesService(map);
        service.getDetails(request, callback);

        function callback(place, status) {

            if (status == google.maps.places.PlacesServiceStatus.OK) {
                //console.log(place);
                $scope.details = place;
                console.log($scope.details);
            }
        }
        adjustViews();

    }

    function adjustViews() {
        $scope.showFirstPg = false;
        $scope.showDetailsPg = true;
        console.log($scope.details);
    }
    function toggleVisibility(divId) {
        $("#" + divId).toggle();
    }
    function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        marker.setMap(null);
        directionsDisplay.setPanel(document.getElementById('directionInfo'));

        var selectedMode = document.getElementById('modeOfTransport').value;

        var location;
        if(document.getElementById('start').value==""){
            location={lat:$scope.latitude,lng:$scope.longitude};
        }else{
            location=document.getElementById('start').value;
        }
        //console.log(location);
        directionsService.route({
            //current loc, can be latlan obj - new google.maps.LatLng(41.850033, -87.6500523);
            origin: location ,
            //get it from row, use placeId for eg
            destination: document.getElementById('dest').value,
            //get travel mode from btn click
            travelMode: google.maps.TravelMode[selectedMode]

        }, function (response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }
    //form valid
    /*if($scope.searchForm.$valid) {
        console.log("valid enable");
        $scope.disableSearchBtn=false;
    }*/

});

var autocomplete;
function initAutocomplete() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    autocomplete = new google.maps.places.Autocomplete(
              /** @type {!HTMLInputElement} */(document.getElementById('locationOther')),
        { types: ['geocode'] });
    new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('start')),
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
