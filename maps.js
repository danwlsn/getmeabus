var map;
var localSearch = new GlocalSearch();

function setCenterToPoint(point)
{
  var marker = new google.maps.Marker({
        position: point,
        map: map,
        animation: google.maps.Animation.DROP
      });

  // Center map on postion
  map.setCenter(point);
  $('#map-canvas').removeClass('blur');
  $('.postcode').toggle();
  nearestStops(point.lat(), point.lng());
}

function usePointFromPostcode(postcode, callbackFunction) {
  localSearch.setSearchCompleteCallback(null,
    function() {

      if (localSearch.results[0]) {
        var resultLat = localSearch.results[0].lat;
        var resultLng = localSearch.results[0].lng;
        var point = new google.maps.LatLng(resultLat,resultLng);
        callbackFunction(point);
      }else{
        alert("Postcode not found!");
      }
    });

  localSearch.execute(postcode + ", UK");
}

// Get and print nearest stops
  function nearestStops(lat,lng){
    var url = 'http://transportapi.com/v3/uk/bus/stops/near.json?lat='
    + String(lat) + '&lon=' + String(lng)
    + '&api_key=e2c96777c715a5d317c9d2016fdf5284&app_id=b4d09e5d&callback=?'
    $.getJSON(url, function(data) {
      var busstops = [];
      for (var i = 0; i <= data.stops.length; i++){
        var infowindow = new google.maps.InfoWindow();
        var item = data.stops[i];
        var info = [item.atcocode, item.latitude, item.longitude, item.name];
        busstops.push(info);

        // Dispay stops
        for (i = 0; i < busstops.length; i++) {
          marker = new google.maps.Marker({
            position: new google.maps.LatLng(busstops[i][1], busstops[i][2]),
            map: map,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            atcocode: busstops[i][0]
          });

          google.maps.event.addListener(marker, 'mouseover', (function(marker, i) {
            return function() {
              infowindow.setContent(busstops[i][3]);
              infowindow.open(map, marker);
            }
          })(marker, i));

          // Busstop click event
          google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
              infowindow.setContent(busstops[i][3]);
              $('.bus-stop').html("Selected Bus Stop: " + busstops[i][3]);
              infowindow.open(map, marker);
              getBusTimetable(busstops[i][0]);
            }
          })(marker, i));
        }
      }
    });
  }

  // get bus times
  function getBusTimetable(bonner){
    var currentdate = new Date();
    var date = currentdate.getFullYear() + "-"
                   + (currentdate.getMonth()+1)  + "-"
                   + currentdate.getDate();
    var time = currentdate.getHours() + ":"
                + currentdate.getMinutes();
    var bustimeurl = 'http://transportapi.com/v3/uk/bus/stop/'+bonner+'/'+date+'/'+time+'/timetable.json?group=no&api_key=e2c96777c715a5d317c9d2016fdf5284&app_id=b4d09e5d&callback=?'
    $.getJSON(bustimeurl, function(data) {
      var bustimes = [];
      var timetableLS = $('.display-list');
      timetableLS.html("");
      for (x = 0; x <= data.departures.all.length; x++) {
        var item = data.departures.all[x];
        console.log("Bus Number: " + String(item.line) +
          "Towards: " + String(item.direction) +
          "Next Departure: " + String(item.aimed_departure_time));
        if (x<=2)
        {
          if(item.aimed_departure_time == null)
            break;
          else {
            timetableLS.append( "<li class=\"cf close\"><div class=\"top\"><span class=\"number\">" + String(item.line) + "</span>" +
              "<span class=\"time\">" + String(item.aimed_departure_time) + "</span></div>" +
              "<div class=\"bottom\"> <span class=\"towards-text\"> &rarr; " + String(item.direction) + "</span></div></li>");
          }
        } else {
          if(item.aimed_departure_time == null)
            break;
          else {
            timetableLS.append("<li class=\"cf not-so-close\"><div class=\"top\"><span class=\"number\">" + String(item.line) + "</span>" +
              "<span class=\"time\">" + String(item.aimed_departure_time) + "</span></div>" +
              "<div class=\"bottom\"> <span class=\"towards-text\"> &rarr; " + String(item.direction) + "</span></div></li>");
          }
        }
        if($('.display-list').children('li').length == 0)
          $('.error').html("Sorry, no buses found");
      }
    });
  }

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

  // Default latlng - Takk location
  var lat =53.48131904602191;
  var lng = -2.232416151348957;

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      // Find postcode from latlng
      var gpostcode;
      var Info = {
      	fetch: function(latlng) {
        	var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&sensor=true'
  			  $.getJSON(url, function(json) {
    				window.gpostcode = String((json.results[1].address_components[0].long_name))
           })
      	}
      }

      Info.fetch(String(position.coords.latitude)+","+String(position.coords.longitude));


      // Marker on location
      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        animation: google.maps.Animation.DROP
      });

      // Center map on postion
      map.setCenter(pos);

      // Get nearest stops and print bus times
      nearestStops(position.coords.latitude, position.coords.longitude);

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
      $('.postcode').toggle();
    } else {
      $('#map-canvas').addClass('blur');
      $('.postcode').toggle();
    }

    var options = {
      map: map,
      position: new google.maps.LatLng (53.48131904602191, -2.232416151348957)
    };

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
