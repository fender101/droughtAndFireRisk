// Creating map object
var myMap = L.map("map", {
  center: [38.1002213, -117.3208913], //Tonopah, NV
  // center: [37.8492, -106.9264],    //Creede, CO
  // center: [37.3394, -121.895],     //San Jose, CA
  zoom: 6
});

// Adding tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(myMap);

// Link to GeoJSON
var APILink = "https://api.aerisapi.com/droughts/monitor/search?filter=all,geo&sort=code&format=geojson&client_id=XPvRjjJwk7jY8JHijPi0L&client_secret=zFhTundlhjQ7YzfDD30Vo5w1VKdhlhwLKL2UkuBP";

var geojson;
var lyrChart;

// Grab data with d3
d3.json(APILink, function(data) {

  // Create a new choropleth layer
  geojson = L.choropleth(data, {

    // Define what property in the features to use
    valueProperty: "code",

    // Set color scale
    scale: ["#ffffb2", "#b10026"],

    // Number of breaks in step range
    steps: 4,
    
    // q for quantile, e for equidistant, k for k-means
    mode: "q",
    style: {
      // Border color
      color: "#fff",
      weight: 2,
      fillOpacity: 0.6
    },

    // function getColor(d) {
    //   return d = 1 ? '#800026' :
    //          d = 2 ? '#BD0026' :
    //          d = 3 ? '#E31A1C' :
    //          d = 4 ? '#FC4E2A' :;
    // },

    // Binding a pop-up to each layer
    onEachFeature: function(feature, layer) {
      layer.bindPopup(feature.properties.details.risk.type + " - " + feature.properties.details.risk.name);
    },
  }).addTo(myMap);

  lyrChart = L.imageOverlay("./chart.png", [[36.05, -132.05], [34.05, -122.05]]).addTo(myMap);


  // Set up the legend
  var legend = L.control({ position: "topleft" });
  // var chart = L.control({position: "bottomleft"});

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = geojson.options.limits;
    var colors = geojson.options.colors;
    var labels = [];

    // Add min & max
    var legendInfo = "<h1>Drought Level</h1>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">" + "None" + "</div>" +
        "<div class=\"max\">" + "D4" + "</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);

});
