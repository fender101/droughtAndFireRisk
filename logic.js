// Create a GeoJSON layer containing the features array on the fire and drought objects
var fire = L.geoJson(null, {
    filter: function() {
        return true;
        }
});

var drought = L.geoJson(null, {
  filter: function() {
      return true;
      }
});

// Define base layers: streetmap and darkmap layers
var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
});


var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });


// Define a baseMaps object to hold base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold overlay layer
  var overlayMaps = {
    CalFire: fire,
    Drought: drought
  };

  // Create map, giving it the streetmap, fire and drought layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -120.71],
    zoom: 6,
    layers: [streetmap, fire, drought]
  });

  // Create a layer control; pass in baseMaps and overlayMaps; add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


// Omnivore will AJAX-request this file behind the scenes and parse it
omnivore.csv('./fire.csv').on('ready', function(layer) {
    this.eachLayer(function(marker) {
      marker.setIcon(L.icon({
        iconUrl: './fire-element.png',
        iconSize: [marker.toGeoJSON().properties.Range, marker.toGeoJSON().properties.Range],
        iconAnchor: [9, 21],
        popupAnchor: [0, -14]
      }));

      console.log (marker.toGeoJSON())
			marker.bindPopup("<h3>" + marker.toGeoJSON().properties.Name + ' Fire ' + "<br>" +
			marker.toGeoJSON().properties.Start_Date +  "<hr>" + " # of Deaths:  " +
			marker.toGeoJSON().properties.Deaths + "</h3>");
	});

  }).addTo(fire);

  
//Drought layer code

var droughtData = {};

d3.json("https://api.aerisapi.com/droughts/monitor/search?filter=all,geo&sort=code&format=geojson&client_id=XPvRjjJwk7jY8JHijPi0L&client_secret=zFhTundlhjQ7YzfDD30Vo5w1VKdhlhwLKL2UkuBP",
  function(data) {
    droughtData = data;

// // Binding a pop-up to each layer
// 		onEachFeature: function(feature, layer) {
// 		layer.bindPopup(feature.properties.details.risk.type + " - " + feature.properties.details.risk.name)};
// // }).addTo(myMap);


	// control that shows info on hover
	var info = L.control();

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (props) {
		this._div.innerHTML = '<h4></h4>' +  (props ?
			'<b>' + props.features.properties.risk.name + '</b><br/>' + props.features.properties.risk.type
			: '')
	};

	info.addTo(myMap);

	// get color depending on drought condition value
	function getColor(d) {
		return  d == 4  ? '#800026' :
			      d == 3  ? '#BD0026' :
				    d == 2  ? '#E31A1C' :
				    d == 1  ? '#FC4E2A' :
            d == 0  ? '#FD8D3C' :
                		  '#FFEDA0' ;
	}

	function style(feature) {
		return {
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 0.7,
			fillColor: getColor(feature.properties.details.risk.code)
		};
	};

	function highlightFeature(e) {
		var layer = e.target;

		layer.setStyle({
			weight: 5,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}

		info.update(layer.feature.properties);
	}

	var geojson;
	var lyrChart;
	var draugtlevels;

	lyrChart = L.imageOverlay("./chart.png", [[36.05, -132.05], [34.05, -122.05]]).addTo(myMap);
	lyrChart = L.imageOverlay("./draughtlevel.png", [[33.55, -132.05], [31.75, -122.05]]).addTo(myMap);

	function resetHighlight(e) {
		geojson.resetStyle(e.target);
		info.update();
	}

	// function zoomToFeature(e) {
	// 	myMap.fitBounds(e.target.getBounds());
	// }

	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			// click: zoomToFeature
		});
	}

	geojson = L.geoJson(droughtData, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(myMap);

	// var legend = L.control(  {
  //   position: 'bottomleft'
  // });

	// legend.onAdd = function (map) {

	// 	var div = L.DomUtil.create('div', 'info legend'),
  //           grades = ["None", "D0", "D1", "D2", "D3", "D4"],
  //     			labels = [],
	// 		      from, to;

	// 	for (var i = 0; i < grades.length; i++) {
	// 		from = grades[i];
	// 		to = grades[i + 1];

	// 		labels.push(
  //               '<i style="background:' + getColor(from + 1) + '"></i> ' 
  //               + from); 
  //               // + (to ? '&ndash;' + to : '+'));
	// 	}

	// 	div.innerHTML = labels.join('<br>');
	// 	return div;
	// };

	legend.addTo(myMap);
});

