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

  // Default latlng
  var lat =53.48131904602191;
  var lng = -2.232416151348957;

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

    // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      // Post code business
      var gpostcode;
      var Info = {
      	fetch: function(latlng) {
        	var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&sensor=true'
  			  $.getJSON(url, function(json) {
    				window.gpostcode = String((json.results[1].address_components[0].long_name))
    				$('.code').html(window.gpostcode)
            var infowindow = new google.maps.InfoWindow({
              map: map,
              position: pos,
              content: window.gpostcode
            });
           })
      	}
      }

      // replacing the above function
      // Should return postcode when complete
      // Just returning Object object so far
      // function latLngToPostcode(latlng) {
      //   var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&sensor=true';
      //   return $.getJSON(url, function(json) {
      //       GlobalPostcode = String(json.results[1].address_components[0].long_name);
      //      })
      // }

      // function itCantBeThatEasy(latlng) {
      //   var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&sensor=true';
      //   // var json = $.getJSON(url);
      //   $.getJSON(url, function(json) {
      //       String(json.results[1].address_components[0].long_name));
      //   })
      // }

      // itCantBeThatEasy(String(position.coords.latitude)+","+String(position.coords.longitude));

      // Alert as debug for above function
      // alert(latLngToPostcode(String(position.coords.latitude)+","+String(position.coords.longitude)));

      Info.fetch(String(position.coords.latitude)+","+String(position.coords.longitude));

      // Marker on location
      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        animation: google.maps.Animation.DROP
      });

      // Center map on postion
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
      $('.postcode--search').toggle();
      var content = 'Error: The Geolocation service failed.';
    } else {
      $('#map-canvas').addClass('blur');
      $('.postcode--search').css('display', 'block');
      var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
      map: map,
      position: new google.maps.LatLng (lat, lng),
      content: content
    };

    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
  }
}

google.maps.event.addDomListener(window, 'load', initialize);