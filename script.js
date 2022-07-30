var map = null;
var markers = [];

function initMap() {
  var mapOptions = {
    zoom: 10,
    center: new google.maps.LatLng(52.1874047455997, 5.350341796875),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  map.addListener('click', function(event) {
      addMarker(event.latLng);
    });
    
    poly = new google.maps.Polyline({
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 3
    });
    poly.setMap(map);
}

function addMarker(location) {
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });
    markers.push(marker);
    
    var path = poly.getPath();
    path.push(location);
  }
  
function deleteLast()
{
	markers[markers.length-1].setMap(null);
	
	markers.pop();
	
	var path = poly.getPath();
    path.pop();
    
    hideResult();
}

function centerCurrentLocation()
{
	if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(pos);
        map.setZoom(17);
      }, function() {
      	alert("Something went wrong, try finding your location manualy.");
      });
    } else {
      alert("Your browser doesn't support this.");
    }
}

function generateGPX(download = false)
{
	var url = "./data.php?speed=" + $("#speed").val()+"&speedType=" + $("#speedType").val()+"&";

    var elevator = new google.maps.ElevationService();

    var locations = [];
    for(i=0; i<markers.length; i++) {
        locations.push(markers[i].position);
    }

    var positionalRequest = {
        'locations': locations
    }

    elevator.getElevationForLocations(positionalRequest, function(results, status) {
        if (status == google.maps.ElevationStatus.OK) {
            if (results[0]) {
                for (var i=0; i< results.length; i++) {
                    url += "c[]=" + markers[i].position.lat() + "," + markers[i].position.lng() + "," + results[i].elevation.toFixed(2) + (i < (results.length - 1) ? "&" : "");
                }
            }
        }
        if(download == true) {
            window.location.href = url + "&dl=true";
            ga('send', 'event', 'actie', 'download_gpx');

        }
        else {
            $.get(url, function (data) {

                $("#resultContentHolder").css("display", "block");
                $("#result").val(data);
                $("#result").select();
                ga('send', 'event', 'actie', 'view_gpx');
            });
        }
    });
}

function logCoffee()
{
    ga('send', 'event', 'actie', 'openCoffee');
}

function hideResult()
{
    $("#resultContentHolder").css("display","none");
}