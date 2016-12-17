// common data among ajax calls - this will give us a natural existing connection between two APIs, 
// rather than forcing it

var latitude = 30.2672; 
var longitude = -97.7431;




function getSolarTimes() {

	// sunrises and other time date based on coordinates

	queryURL2 = "http://api.sunrise-sunset.org/json?lat=" + latitude + "&lng=" + longitude + "&date=today";

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
};

// google maps 

// var gmKey = "AIzaSyD-v-7mR5Rs0s1dGKX4pEbfvp6aImogy4E";

function initAutocomplete() {
	var map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 30.2672, lng: -97.7431},
	  zoom: 13,
	  mapTypeId: 'roadmap'
	});

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
			latitude = ((place.geometry.viewport.f.f + place.geometry.viewport.f.b)/2);
			longitude = ((place.geometry.viewport.b.f + place.geometry.viewport.b.b)/2);
			getSolarTimes();
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

$(document).ready(function() {
	getSolarTimes();
})