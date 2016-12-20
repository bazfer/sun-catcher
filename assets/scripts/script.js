// common data among ajax calls - this will give us a natural existing connection between two APIs, 
// rather than forcing it
  // Initialize Firebase
var config = {
apiKey: "AIzaSyCu_KaOTFf1ZdH-yamzF9okHFTYkXj-maI",
authDomain: "project1-2ec2e.firebaseapp.com",
databaseURL: "https://project1-2ec2e.firebaseio.com",
storageBucket: "project1-2ec2e.appspot.com",
messagingSenderId: "446413217477"
};
firebase.initializeApp(config);
database = firebase.database();

var googleAPIKey = "AIzaSyD-v-7mR5Rs0s1dGKX4pEbfvp6aImogy4E";
var latitude = 30.2672; 
var longitude = -97.7431;
var date = "today";
var currentUser = "Guest";


function getData() {
	database.ref().on("child_added", function(snapshot) {
		var data = snapshot.val();
		$("#previousSearches").append("<tr><td>" + data.user + "</td><td>" + data.latitude + "</td><td>" + data.longitude + "</td></tr>")
	});
}
function getSolarTimes() {

	var timestamp = moment().unix();

	timezoneURL = "https://maps.googleapis.com/maps/api/timezone/json?location=" + latitude + "," + longitude + "&timestamp=" + timestamp + "&key=" + googleAPIKey;

	solarQueryURL = "http://api.sunrise-sunset.org/json?lat=" + latitude + "&lng=" + longitude + "&date=" + date;

	$.ajax({ url: timezoneURL, method: "GET" }).done(function(response) {

		var offset = (response.rawOffset + response.dstOffset)/3600;

		$.ajax({ url: solarQueryURL, method: "GET" }).done(function(response) {
			var solarData = response.results;

			var sunrise = moment(moment(solarData.sunrise, "hh:mm:ss A")).add(offset, "hours").format("hh:mm:ss A");
			var sunset = moment(moment(solarData.sunset, "hh:mm:ss A")).add(offset, "hours").format("hh:mm:ss A");
			var solar_noon = moment(moment(solarData.solar_noon, "hh:mm:ss A")).add(offset, "hours").format("hh:mm:ss A");
			var day_length = solarData.day_length;

			$("#sunrise").html("Sunrise: " + sunrise);
			$("#sunset").html("Sunset: " + sunset);
			$("#solar_noon").html("Solar Noon: " + solar_noon);
			$("#day_length").html("Day Length: " + day_length);
		});
	});
};

function storeData() {
	database.ref().push( {
		user: currentUser,
		latitude: latitude,
		longitude: longitude
	})
}

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
			storeData();
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
	$(document).on("click", "#submitUsernameButton", function(event) {
		event.preventDefault();
		currentUser = $("#username").val().trim();
		$("#username").val("");
		$("#login").hide();
		$("#loginStatus").html("<h3><small>You are currently logged in as: " + currentUser + "</small></h3><button id='changeUserButton'>Login as a Different User</button>");
	});

	$(document).on("click", "#changeUserButton", function() {
		$("#changeUserButton").remove();
		$("#login").show();
	});

	$("#loginStatus").html("<h3><small>You are currently not logged in.</small></h3>");
	getData();
	getSolarTimes();
});