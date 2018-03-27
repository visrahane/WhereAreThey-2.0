var app = angular.module("loadApp", []);
app.controller("locController", function ($scope, $http) {
    $scope.nextPageUrl = {};
    $scope.latitude;
    $scope.pages = [];
    var currentPage = 0;
    $http({
        method: "GET",
        url: "http://ip-api.com/json"
    }).then(function mySuccess(response) {
        // var locationJson=JSON.parse(response);
        $scope.latitude = response.data.lat;
        longitude = response.data.lon;

        console.log(response.data.lon);
        console.log(response.data.lat);
    }, function myError(response) {
        console.log("Error:", response);
    });

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
        console.log("location", location);
        $http({
            method: "GET",
            url: "http://webtechtravel-env.us-east-2.elasticbeanstalk.com/searchResults",
            params: {
                category: $scope.category,
                distance: $scope.distance,
                keyword: $scope.keyword,
                latitude: $scope.latitude,
                longitude: longitude,
                location: location
            }
        }).then(function mySuccess(response) {
            // var locationJson=JSON.parse(response);
            console.log(response.data);
            $scope.pages[currentPage++] = $scope.results = response.data.results;
            if ($scope.results.length == 0) {
                $scope.showNoRecordsBox = true;
            }
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
    $scope.getDetails = function (index) {
        console.log("getDetails-", $scope.results[index].place_id);
        var request = {
            placeId: $scope.results[index].place_id
        };
        var map = new google.maps.Map(document.createElement('div'), {
            center: {
                lat: $scope.results[index].geometry.location.lat,
                lng: $scope.results[index].geometry.location.lng
            },
            zoom: 15
        });
        service = new google.maps.places.PlacesService(map);
        service.getDetails(request, callback);

        function callback(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log(place)
            }
        }
    }
    function toggleVisibility(divId) {
        $("#" + divId).toggle();
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
