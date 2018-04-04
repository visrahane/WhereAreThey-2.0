/*moment.unix(time).format('YYYY-MM-DD h:mm:ss');
http://cs-server.usc.edu:45678/hw/hw8/images/Twitter.png
*/
var app = angular.module("loadApp", ["ngAnimate"]);
app.controller("locController", function ($scope, $http) {
    $scope.nextPageUrl = {};
    $scope.latitude;
    $scope.longitude;
    $scope.pages = [];
    $scope.yelpData = [];
    $scope.details = {};
    $scope.yelpDataDefault = {};
    $scope.reviewsDefault = {};
    $scope.twitterLink="";
    $scope.fav = JSON.parse(localStorage.getItem("favList"));
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
    $scope.deleteFav = function (index) {
        $scope.fav.pop($scope.fav[index]);
        localStorage.setItem("favList", JSON.stringify($scope.fav));
    }

    $scope.isFav = function (result) {
        var favorite = false;        
        angular.forEach($scope.fav, function (fav, index) {
            if (result.place_id == fav.place_id) {
                favorite = true;
            }
        })
        return favorite;
    }
    $scope.saveToFav = function (index) {
        console.log("isFav-",index);
        if (!$scope.fav) {
            $scope.fav = [];
        }
        $scope.fav.push($scope.results[index]);
        localStorage.setItem("favList", JSON.stringify($scope.fav));
        
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
    $scope.getPrice = function () {
        var price = "";
        for (var i = 0; i < $scope.details.price_level; i++) {
            price += "$";
        }
        return price;
    }
    $scope.getNumber = function (num) {
        //alert(num);
        return new Array(num);
    }
    $scope.getUrl = function (photo, index) {
        return $scope.details.photos[index].getUrl({ 'maxWidth': 2000, 'maxHeight': 2000 });
    }
    $scope.sortReviews = function () {
        switch ($scope.selectedOrder) {
            case "Highest Rating":
                if ($scope.selectedReview == 'Yelp Reviews') {
                    $scope.yelpData.sort(function (a, b) {
                        return b.rating - a.rating;
                    });
                } else {
                    $scope.details.reviews.sort(function (a, b) {
                        return b.rating - a.rating;
                    });
                }
                break;
            case "Lowest Rating":
                if ($scope.selectedReview == 'Yelp Reviews') {
                    $scope.yelpData.sort(function (a, b) {
                        return a.rating - b.rating;
                    });
                } else {
                    $scope.details.reviews.sort(function (a, b) {
                        return a.rating - b.rating;
                    });
                }
                break;
            case "Least Recent":
                if ($scope.selectedReview == 'Yelp Reviews') {
                    $scope.yelpData.sort(function (a, b) {
                        var d1 = new Date(a.time_created);
                        var d2 = new Date(b.time_created);
                        return d1 - d2;
                    });
                } else {
                    $scope.details.reviews.sort(function (a, b) {
                        var d1 = new Date(a.time);
                        var d2 = new Date(b.time);
                        return d1 - d2;
                    });
                }
                break;
            case "Most Recent":
                if ($scope.selectedReview == 'Yelp Reviews') {
                    $scope.yelpData.sort(function (a, b) {
                        var d1 = new Date(a.time_created);
                        var d2 = new Date(b.time_created);
                        return d2 - d1;
                    });
                } else {
                    $scope.details.reviews.sort(function (a, b) {
                        var d1 = new Date(a.time);
                        var d2 = new Date(b.time);
                        return d2 - d1;
                    });
                } break;
            case "Default Order":
            default:
                if ($scope.selectedReview == 'Yelp Reviews') {
                    $scope.yelpData = $scope.yelpDataDefault.slice(0);
                } else {
                    $scope.details.reviews = $scope.reviewsDefault.slice(0);
                }
                break;
        }
    }
    $scope.getDetails = function (result, index) {
        //init config
        $scope.placeIndex=index;
        console.log("resultObj", result);
        $scope.idSelectedResult = index;
        $scope.disableDetailsBtn = false;

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
        service.getDetails(request, function (place, status) {

            if (status == google.maps.places.PlacesServiceStatus.OK) {
                //console.log(place);
                
                $scope.details  = place;
                prepareDefaultCopy($scope.details);
                preparePhotoGallery(place);
                modifyTimeForReviews(place);
                getYelpReviews(place);
                setTwitterText(place);
                //setRating 
                $("#rateYo").rateYo({ rating: $scope.details.rating, readOnly: true, starWidth: "10px" });
                //$("#rateYo").rateYo("option", "starWidth", "10px");
                //document.getElementById("rateYo").rateYo("rating", $scope.details.rating);
                console.log("details obj in callback", $scope.details);

                return $scope.details;
            }
        })
        adjustViews();

    }
    function setTwitterText(place){
        var websiteUrl="www.google.com";
        if(place.website!=null){
            websiteUrl=place.website;
        }
        var params = jQuery.param({
            text: 'Check out '+place.name+" located at "+place.formatted_address+". Website:",
            url: websiteUrl
        });
        var s= "https://twitter.com/intent/tweet?"+params;
        $scope.twitterLink=s;
    }
    function prepareDefaultCopy(details){
        if(details.reviews!=null){
            $scope.reviewsDefault=details.reviews.slice(0);
        }
    }
    function getYelpReviews(place) {
        var address = place.formatted_address.split(",");
        console.log(address);
        $http({
            method: "GET",
            url: "http://webtechtravel-env.us-east-2.elasticbeanstalk.com/yelpReviews",
            params: {
                name: place.name,
                city: address[1],
                state: address[2].trim().split(" ")[0],
                country: "US",
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                address1: address[0]
            }
        }).then(function mySuccess(response) {
            console.log("yelp-", response.data);
            $scope.yelpData =  response.data;
            $scope.yelpDataDefault =$scope.yelpData.slice(0);

        }, function myError(response) {
            console.log("Error:", response);
            $scope.showErrorBox = true;
        });
    }
    function createColumn() {
        var col = document.createElement("div");
        col.setAttribute("class", "column");
        return col;
    }
    function modifyTimeForReviews(place) {
        for (var i = 0; place.reviews != null && i < place.reviews.length; i++) {
            place.reviews[i].time = moment.unix(place.reviews[i].time).format('YYYY-MM-DD h:mm:ss');
        }
    }
    function preparePhotoGallery(place) {
        var photoRow = document.getElementById("photoRow");
        //clear previous data
        photoRow.innerHTML = "";

        var col1 = createColumn();
        var col2 = createColumn();
        var col3 = createColumn();
        var col4 = createColumn();

        for (var i = 0; place.photos != null && i < Math.ceil(place.photos.length / 4); i++) {
            appendImgToCol(col1, place.photos[i * 4]);
            appendImgToCol(col2, place.photos[i * 4 + 1]);
            appendImgToCol(col3, place.photos[i * 4 + 2]);
            appendImgToCol(col4, place.photos[i * 4 + 3]);
        }
        photoRow.appendChild(col1);
        photoRow.appendChild(col2);
        photoRow.appendChild(col3);
        photoRow.appendChild(col4);
    }
    function appendImgToCol(col, photo) {
        var imgTag = document.createElement("img");
        if (photo != null) {
            imgTag.setAttribute("src", photo.getUrl({ 'maxWidth': 2000, 'maxHeight': 2000 }));
        }
        imgTag.setAttribute("width", "100%");
        col.appendChild(imgTag);
    }
    function adjustViews() {

        $scope.showFirstPg = false;
        $scope.showDetailsPg = true;
        console.log("inViews", $scope.details);
        console.log("inViews", $scope.showFirstPg);
        console.log("inViews", $scope.showDetailsPg);
    }
    function toggleVisibility(divId) {
        $("#" + divId).toggle();
    }
    function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        marker.setMap(null);
        directionsDisplay.setPanel(document.getElementById('directionInfo'));

        var selectedMode = document.getElementById('modeOfTransport').value;

        var location;
        if (document.getElementById('start').value == "") {
            location = { lat: $scope.latitude, lng: $scope.longitude };
        } else {
            location = document.getElementById('start').value;
        }
        //console.log(location);
        directionsService.route({
            //current loc, can be latlan obj - new google.maps.LatLng(41.850033, -87.6500523);
            origin: location,
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
