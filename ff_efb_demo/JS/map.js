/**
 * Created by USER on 23.08.2017.
 */
var map;
var api = new FlightFactor();

function mapInit() {

    var map_options = {
        zoom: 10,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        panControl: false,
        center: new google.maps.LatLng(0, 0),
        scrollwheel: true,
        draggable: false,
        gestureHandling: 'greedy'
    };

    var mapDomEl = document.getElementById('map');
    map = new google.maps.Map(mapDomEl, map_options);
    map.setMapTypeId(google.maps.MapTypeId.HYBRID);

    google.maps.event.addDomListener(mapDomEl, 'mousewheel', function(e){
        var step = 1;
        var zoom = map.getZoom();

        var delta = e.deltaY > 0 ? -1 : 1;
        zoom += (step * delta);
        zoom = zoom < 2 ? 2 : zoom;
        zoom = zoom > 18 ? 18 : zoom;

        map.setZoom(zoom);

        //var service = new google.maps.MaxZoomService();
        //service.getMaxZoomAtLatLng(map.getCenter(), function(r) {
        //    console.log(r);
        //});
    });

    map.addListener('mousewheel', function(){
        console.log('WTF');
    });

    /*
     var path=new google.maps.Polyline({
     path: flight_plan.GetLatLngPath(),
     geodesic: true,
     strokeColor: '#FF0000',
     strokeOpacity: 1.0,
     strokeWeight: 2
     });
     path.setMap(map);
     */

    var plane_icon = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        fillColor: 'red',
        fillOpacity: 0.8,
        scale: 5,
        strokeWeight: 3,
        anchor: new google.maps.Point(0, 2),
        rotation: 0
    };

    //function make_navaid_icon(color) {
    //    return {
    //        path: google.maps.SymbolPath.CIRCLE,
    //        fillColor: color,
    //        fillOpacity: 0.8,
    //        scale: 3,
    //        strokeWeight: 2,
    //        strokeColor: 'black'
    //    };
    //}

    //var navaid_icon_green = make_navaid_icon('green');
    //var navaid_icon_cyan = make_navaid_icon('cyan');
    //var navaid_icon_yellow = make_navaid_icon('yellow');
    //var navaid_icon_magenta = make_navaid_icon('magenta');
    //var navaid_icon_blue = make_navaid_icon('blue');
    //var navaid_icon_white = make_navaid_icon('white');
    //
    //var navaid_marker = [];
    //var navaid_marker_process = 0;

    var plane_marker = new google.maps.Marker({
        optimized: false,
        position: new google.maps.LatLng(0, 0),
        title: "Plane",
        icon: plane_icon,
        zIndex: 1
    });

    plane_marker.setMap(map);

    var plane_lat = 0;
    var plane_lon = 0;
    var plane_heading = 0;

    function PlaneDataUpdate() {
        var position = new google.maps.LatLng(plane_lat, plane_lon);
        plane_icon.rotation = Math.round(plane_heading); // FIXME: bug in google maps?
        // https://stackoverflow.com/questions/19826767/google-maps-markers-disappearing-randomly?rq=1
        // https://stackoverflow.com/questions/16317072/google-maps-api-v3-svg-markers-disappear
        //console.log('rotate: ' + plane_icon.rotation + '   lat: ' + (Math.round(plane_lat * 1000) / 1000) + '   lon: ' + (Math.round(plane_lon * 1000) / 1000));
        plane_marker.setIcon(plane_icon);
        plane_marker.setPosition(position);
        google.maps.event.trigger(map, "resize");
        map.setCenter(position);
        map.panTo(map.getCenter());
    }

    function PlaneLatData(data) {
        plane_lat = data;
    }

    function PlaneLonData(data) {
        plane_lon = data;
    }

    function PlaneHeadingData(data) {
        plane_heading = data;
        PlaneDataUpdate();
    }

    function PlaneDataRequest() {
        api.Get("Aircraft.Lat", PlaneLatData);
        api.Get("Aircraft.Lon", PlaneLonData);
        api.Get("Aircraft.Heading", PlaneHeadingData);

        setTimeout(PlaneDataRequest, 100);
    }

    setTimeout(PlaneDataRequest, 100);
}

var googleMapScriptIsLoaded = false;

function loadScript(gKey) {
    if (!googleMapScriptIsLoaded) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://maps.googleapis.com/maps/api/js?key=" + gKey + "&callback=mapInit"; // &sensor=false
        document.body.appendChild(script);
        googleMapScriptIsLoaded = true;
    }
}

function showMap() {
    api.Get("Simulation.GoogleKey", function(gKey) {
        if (gKey != "") {
            loadScript(gKey);
        } else {
            $('#gKeyInput').show();
            $('#saveKeyBtn').on('click', function() {
                var newKey = $('#gKey').val();
                api.Set("Simulation.GoogleKey", '"' + newKey + '"');
                $('#gKeyInput').hide();
                loadScript(newKey);
            });
        }
    });
}

//window.onload = showMap;