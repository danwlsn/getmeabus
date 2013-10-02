var map;
function initialize() {
  var mapOptions = {
    zoom: 17,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: "poi",
        stylers: [
        { visibility: "off" }
      ]
      }
    ]
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

    // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      var Info = {
      	fetch: function(latlng) {
      	var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&sensor=true'
			$.getJSON(url, function(json) {
				var postcode = String((json.results[1].address_components[0].long_name)+' Yo Bitch!')
				console.log(postcode +' THIS IS ADDED IN THE CONSOLE');
				$('.code').html(json.results[1].address_components[0].long_name)
			})
      	}
      }

      Info.fetch(String(position.coords.latitude)+","+String(position.coords.longitude));

      var infowindow = new google.maps.InfoWindow({
        map: map,
        position: pos,
        content: String(pos)
      });

      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        animation: google.maps.Animation.DROP
      });

      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }

  function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
      $('#map-canvas').addClass('blur');
      $('.postcode').css('display', 'block');
      var content = 'Error: The Geolocation service failed.';
    } else {
      $('#map-canvas').addClass('blur');
      $('.postcode').css('display', 'block');
      var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
      map: map,
      position: new google.maps.LatLng
(53.48131904602191, -2.232416151348957),
      content: content
    };

    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
  }
}

google.maps.event.addDomListener(window, 'load', initialize);