// common data among ajax calls - this will give us a natural existing connection between two APIs, 
// rather than forcing it

var iLat = 20.682986; 
var iLng = -88.568649;




document.addEventListener('DOMContentLoaded', function () {


// sunrises and other time date based on coordinates

queryURL2 = "http://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&date=today";

$.ajax({ url: queryURL2, method: "GET" }).done(function(response) {
	var holdThis = response.results;

	var sunrise = holdThis.sunrise;
	var sunset = holdThis.sunset;
	var solar_noon = holdThis.solar_noon;
	var day_length = holdThis.day_length;

	$("#sunrise").html(sunrise);
	$("#sunset").html(sunset);
	$("#solar_noon").html(solar_noon);
	$("#day_length").html(day_length);

});


// google maps 

// var gmKey = "AIzaSyD-v-7mR5Rs0s1dGKX4pEbfvp6aImogy4E";

var lang;
  if (document.querySelectorAll('#map').length > 0)
  {
    if (document.querySelector('html').lang)
      lang = document.querySelector('html').lang;
    else
      lang = 'en';

    var js_file = document.createElement('script');
    js_file.type = 'text/javascript';
    js_file.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD-v-7mR5Rs0s1dGKX4pEbfvp6aImogy4E&callback=initMap&signed_in=true&language=' + lang;
    document.getElementsByTagName('head')[0].appendChild(js_file);
  }  
});

var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: iLat, lng: iLng},
    zoom: 8
  });
}

function initAutocomplete() {
        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location
            }));

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);
        });
      }

