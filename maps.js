var map;
function initialize() {
  var mapOptions = {
    zoom: 16,
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

      Info.fetch(String(position.coords.latitude)+","+String(position.coords.longitude));


      // This block locates the nearest bus stops
      var url = 'http://transportapi.com/v3/uk/bus/stops/near.json?lat='
      + String(position.coords.latitude) + '&lon=' + String(position.coords.longitude)
      + '&api_key=e2c96777c715a5d317c9d2016fdf5284&app_id=b4d09e5d'
      $.getJSON(url, function(data) {
        var busstops = [];
        for (var i = 0; i <= data.stops.length; i++){
          var infowindow = new google.maps.InfoWindow();
          var item = data.stops[i];
          var info = [item.atcocode, item.latitude, item.longitude];
          busstops.push(info);

          for (i = 0; i < busstops.length; i++) {
            marker = new google.maps.Marker({
              position: new google.maps.LatLng(busstops[i][1], busstops[i][2]),
              map: map,
              icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              atcocode: busstops[i][0]
            });

            google.maps.event.addListener(marker, 'click', (function(marker, i) {
              return function() {
                infowindow.setContent(busstops[i][0]);
                infowindow.open(map, marker);
                getBusTimetable(infowindow.content);
              }
            })(marker, i));
          }
        }
      });

      // This block displaces the bus departure times for the selceted bus stop using the actocode
      function getBusTimetable(bonner){
        var currentdate = new Date();
        var date = currentdate.getFullYear() + "-"
                       + (currentdate.getMonth()+1)  + "-"
                       + currentdate.getDate();
        var time = currentdate.getHours() + ":"
                    + currentdate.getMinutes();
        var bustimeurl = 'http://transportapi.com/v3/uk/bus/stop/'+bonner+'/'+date+'/'+time+'/timetable.json?group=no&api_key=e2c96777c715a5d317c9d2016fdf5284&app_id=b4d09e5d'
        $.getJSON(bustimeurl, function(data) {
          // console.log(String(bustimeurl));
          var bustimes = [];
          for (x = 0; x <= data.departures.all.length; x++) {
            console.log("Bus Number: " + String(data.departures.all[x].line) +
              "\nTowards: " + String(data.departures.all[x].direction) +
              "\nNext Departure: " + String(data.departures.all[x].aimed_departure_time));
            var times = [data.departures.all[x].line, data.departures.all[x].direction, data.departures.all[x].aimed_departure_time];
            bustimes.push(times);
            for (y = 0; y <= bustimes.length; y++) {
              $('.display-timetable').html("Bus Number: " + String(bustimes[y][0]) +
              "\nTowards: " + String(bustimes[y][1]) +
              "\nNext Departure: " + String(bustimes[y][2]));
            }
          }
        });
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

      /* **************************
      * replacing the above function
      * Should return postcode when complete
      * Just returning Object object so far
      function latLngToPostcode(latlng) {
        var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&sensor=true';
        return $.getJSON(url, function(json) {
            GlobalPostcode = String(json.results[1].address_components[0].long_name);
           })
      }

      function itCantBeThatEasy(latlng) {
        var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&sensor=true';
        // var json = $.getJSON(url);
        $.getJSON(url, function(json) {
            String(json.results[1].address_components[0].long_name));
        })
      }

      itCantBeThatEasy(String(position.coords.latitude)+","+String(position.coords.longitude));

      * Alert as debug for above function
      alert(latLngToPostcode(String(position.coords.latitude)+","+String(position.coords.longitude)));
      * *******************************/

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
      position: new google.maps.LatLng (53.48131904602191, -2.232416151348957)
    };

    // var options = {
    //   map: map,
    //   position: new google.maps.LatLng (53.48131904602191, -2.232416151348957)
    //   position: new google.maps.LatLng (lat, lng),
    //   content: content
    // };

    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
  }

  /* ***********************
  * None of this shit works.
  * ************************
  var localSearch = new GlocalSearch();
  function usePointFromPostcode(postcode, callbackFunction) {
    localSearch.setSearchCompleteCallback(null,
      function() {
        if (localSearch.results[0]) {
          var resultLat = localSearch.results[0].lat;
          var resultLng = localSearch.results[0].lng;
          var point = new GLatLng(resultLat,resultLng);
          callbackFunction(point);
        }else{
          alert("Postcode not found!");
        }
      });
    localSearch.execute(postcode + ", UK");
  }

  // DOM listener
  google.maps.event.addDomListener(document.getElementById('postcode--btn'), 'click', function(){
    alert('button pressed');
    usePointFromPostcode(document.getElementById('postcode--input').value, setCenterToPoint);
  })

  * *********************/
}

google.maps.event.addDomListener(window, 'load', initialize);