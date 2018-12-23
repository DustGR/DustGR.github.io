//Color scale
var color = d3.scaleLinear()
  .domain([0, 4, 7, 10])
  .range(['green', 'brown', 'red', 'magenta']);

//URL for earthquake feed
var firstQuery = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

//URL for tectonic plates
secondQuery = "./static/js/PB2002_boundaries.json"


//Load basemap - basic street map
var basemap
if (typeof API_KEY !== 'undefined') {
  var basemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: API_KEY
  });
}
else {
  var basemap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18,
    });
}

//Function to load GeoJSON and get back a layer
//pass a Query URL and a function or object of options
//get back a layer
function loadGeoJSON(queryUrl, options = 0) {
  return d3.json(queryUrl).then(function(data) {

    switch (typeof options) {
    //If object was passed
    case 'object':
      return L.geoJSON(data.features, options);

    //If styling function was passed
    case 'function':
      return L.geoJSON(data.features, options(data.features));

    //If some other datatype or nothing was passed
    default:
      return L.geoJSON(data.features)
    }
  })
}

//Function for adding tooltips to each feature
function addTooltip(feature, layer) {
  layer.bindPopup("<h3>" + feature.properties.place +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"
    + "<p>" + feature.properties.mag
    )
};

//Function to style earthquake
var styleQuakes = function (f) {
  //Defines style options for the markers
  function geoJSONOptions (feat) {
    var outColor = d3.rgb(color(feat.properties.mag));
    //From Tim Down at Stack Overflow - 
    //hex.length == 1 ? "0" +hex : hex returns 0+hex if converted length is 1, or leaves it if it is 2.
    function RGBtoHex(c) {
      let hex = c.toString(16)
      return hex.length == 1 ? "0" + hex : hex;
    }
    //Dictionary used to build hex color string
    HexaDict = {
      'r' : RGBtoHex(outColor.r),
      'g' : RGBtoHex(outColor.g),
      'b' : RGBtoHex(outColor.b)
    }
    outColor = `#${HexaDict.r}${HexaDict.g}${HexaDict.b}`

    return {
      'color' : outColor,
      'radius' : 6+feat.properties.mag,
      'fillOpacity' : 0.7,
      attribution: "<a href=\"https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php\">USGS Earthquake Feed</a>"
    }
  }
  
  //pointToLayer to return circle markers with style specified above
  let outputObj = {
      onEachFeature : addTooltip,
      pointToLayer : function (feature, latlng) {
          return L.circleMarker(latlng, geoJSONOptions(feature));
      }
    }

  return outputObj
}



//Function to create the map object
function createMap(baseMaps, overlayMaps) {
  
  var myMap = L.map("map", {
    center: [37.0902, -95.7129],
    zoom: 5,
    layers : [baseMaps['Basemap'], overlayMaps['Tectonic Plates'], overlayMaps['Earthquakes (today)']]
  });
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);
}

//Actually run things:
loadGeoJSON(firstQuery, styleQuakes).then(earthquakes=> {
  //Some things we're passing to the Tectonic Plates layer styling
  let secondQueryOptions = {
    color : 'yellow',
    attribution : 'Peter Bird: <a href="https://github.com/fraxen/tectonicplates">https://github.com/fraxen/tectonicplates</a>'
  }
loadGeoJSON(secondQuery, secondQueryOptions).then(plates => {
  var overlayMaps = {
    "Earthquakes (today)" : earthquakes,
    "Tectonic Plates" : plates
  }
  var baseMaps = {
    "Basemap" : basemap
  }
  createMap(baseMaps, overlayMaps);
});
})
