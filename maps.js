$(function() {
    $("form").submit(function() {
      $('#postbutton').click();
      return false;
    });
});

var map;
var localSearch = new GlocalSearch();

function usePointFromPostcode(postcode, callbackFunction) {
  localSearch.setSearchCompleteCallback(null,
    function() {

      if (localSearch.results[0]) {
        var resultLat = localSearch.results[0].lat;
        var resultLng = localSearch.results[0].lng;
        var point = new google.maps.LatLng(resultLat,resultLng);
        callbackFunction(point);
      }else{
        $('.banner').html('POSTCODE NOT FOUND!')
        // alert("Postcode not found!");
      }
    });

  localSearch.execute(postcode + ", UK");
}

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

// Gets nearest bus stops
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

          // Bus stop click event
          google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
              infowindow.setContent(busstops[i][3]);
              $('.bus-stop').html("Selected Bus Stop: " + busstops[i][3] + "</br><p>Bus times are approximate, be smart and get to the bus stop early!</p>");
              infowindow.open(map, marker);
              getBusTimetable(busstops[i][0]);
            }
          })(marker, i));
        }
      }
    });
  }

  // Print bus times in body
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
        // if (x<=2)
        // {
          // if(item.aimed_departure_time == null)
          //   break;
          // else {
            timetableLS.append("<li class=\"cf close\"><div class=\"top\"><span class=\"number\">" + String(item.line) + "</span>" +
              "<span class=\"minutes\"></span>" +
              "<span class=\"seconds\"></span>" +
              "<span class=\"time\">" + String(item.aimed_departure_time) + "</span></div>" +
              "<div class=\"bottom\"> <span class=\"towards-text\"> &rarr; " + String(item.direction) + "</span></div></li>");
          // }
        // } else {
        //   if(item.aimed_departure_time == null)
        //     break;
        //   else {
        //     timetableLS.append("<li class=\"cf not-so-close\"><div class=\"top\"><span class=\"number\">" + String(item.line) + "</span>" +
        //       "<span class=\"time\">" + String(item.aimed_departure_time) + "</span></div>" +
        //       "<div class=\"bottom\"> <span class=\"towards-text\"> &rarr; " + String(item.direction) + "</span></div></li>");
        //   }
        // }
        // if($('.display-list').children('li').length == 0)
        //   $('.error').html("Sorry, no buses found");
      }
    });
  }

// setInterval(function(){
//     //var future = new Date("Nov 01 2013 " + String(item.aimed_departure_time) + ":00 GMT");
//     var future = new Date("Nov 04 2013 17:50:00 GMT");
//     var now = new Date();
//     var difference = Math.floor((future.getTime() - now.getTime()) / 1000);

//     var seconds = fixIntegers(difference % 60);
//     difference = Math.floor(difference / 60);

//     var minutes = fixIntegers(difference % 60);
//     difference = Math.floor(difference / 60);

//     var hours = fixIntegers(difference % 24);
//     difference = Math.floor(difference / 24);

//     var days = difference;

//     $(".seconds").text(seconds + "s");
//     $(".minutes").text(minutes + "m");
// }, 1000);

// function fixIntegers(integer)
// {
//     if (integer < 0)
//         integer = 0;
//     if (integer < 10)
//         return "0" + integer;
//     return "" + integer;
// }

function initialize() {
	var zoomLevel;
	console.log($(window).width());
	if ($(window).width()<=450)
		zoomLevel=15;
	else
		zoomLevel=16;
  var mapOptions = {
    zoom: zoomLevel,
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

  // Default latlng - Location of Takk
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
      position: new google.maps.LatLng (lat, lng)
    };

    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
  }
}

google.maps.event.addDomListener(window, 'load', initialize);