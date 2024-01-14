import MAPBOX_TOKEN from './config.js';
//var crimeData=[];
var gangData=[];
var gangNames = [];
// Get the loading indicator element
var loadingIndicator = document.getElementById('loading');
// var colors = chroma.scale('Set3').colors(49); // Generate 49 distinct colors
// Initialize an empty set to store the layer ids
var layerIds = new Set();
var selectedYear;
var selectedCrimeType;
var map;

// function isValidGeoJSON(geojsonData) {
//   // Check if it's an object
//   if (typeof geojsonData !== 'object' || geojsonData === null) {
//       console.error("GeoJSON data is not an object");
//       return false;
//   }

//   // Check for the 'type' and 'features' properties
//   if (geojsonData.type !== 'FeatureCollection' || !Array.isArray(geojsonData.features)) {
//       console.error("GeoJSON data does not have the correct type or features property");
//       return false;
//   }

//   // Further checks can be added as needed
//   return true;
// }


// // Get the loading indicator element 


function getHSLColor(i, total) {
    var hue = Math.floor(360 * i / total);
    return 'hsl(' + hue + ', 100%, 50%)';
  }

function convertToGeoJSON(data) {
  return {
    type: 'FeatureCollection',
    features: data.map(item => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)]
      },
      properties: {
        date: item.date,
        primary_type: item.primary_type
      }
    }))
  };
}

function initializeMap(year, crimeType) {
  console.log("Inside initializeMap function 46: ", year, crimeType);
  const mapContainer = document.getElementById('map');

  while (mapContainer.firstChild) {
    mapContainer.removeChild(mapContainer.firstChild);
  }

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-87.6298, 41.8781],
    zoom: 10.5,
    accessToken: MAPBOX_TOKEN
  });
  updateZoomText();
  map.on('zoom', updateZoomText);
  map.on('load', function() {
    loadCrimeDataAndLayers(year, crimeType);
    addLayerVisibilityControl();
  }); 
  loadGangData().then(gangData => {
    // Populate the dropdown with gang names
    const selectGang = document.getElementById('gang-selector');
    gangNames.forEach(gangName => {
      const option = document.createElement('option');
      option.value = gangName;
      option.text = gangName;
      selectGang.appendChild(option);
    });

    // Add the event listener for the dropdown
    document.getElementById('gang-selector').addEventListener('change', function() {
      const selectedGangName = this.value;
      if (selectedGangName) {
        const selectedGangData = gangData.features.find(feature => feature.properties.gangName === selectedGangName);
        if (selectedGangData) {
          const [minLng, minLat, maxLng, maxLat] = turf.bbox(selectedGangData);
          map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 20 });
        }
      }
    });
  });
}

function updateZoomText() {
  var currentZoom = map.getZoom().toFixed(2);
  var zoomText = document.getElementById('zoom-text');
  zoomText.textContent = currentZoom;
}

function updateCounts(year, crimeType, crimeData) {
  var crimeCount = crimeData.features.length;
  console.log("Inside updateCounts function: ", crimeCount);
  var yourUpdatedCrimeType = crimeType;
  var yourUpdatedYear = year;
  var yourUpdatedCount = crimeCount;

  document.getElementById('crime-type-text').textContent = yourUpdatedCrimeType;
  document.getElementById('crime-year-text').textContent = yourUpdatedYear;
  document.getElementById('crime-count-text').textContent = yourUpdatedCount;
}

function loadCrimeDataAndLayers(year, crimeType) {
  fetch(`https://data.cityofchicago.org/resource/ijzp-q8t2.json?$select=primary_type,date,longitude,latitude&$where=year=${year} AND primary_type='${crimeType}'&$limit=50000`)
    .then(response => response.json())
    .then(crimeData => crimeData.filter(item => item.longitude && item.latitude)) // Filter out items without longitude or latitude
    .then(crimeData => crimeData.filter(item => new Date(item.date).getFullYear() == year && item.primary_type == crimeType)) // Filter the data based on the selected year and crime type
    .then(crimeData => {
      crimeData = convertToGeoJSON(crimeData);
        map.addSource('crime-data', {
        type: 'geojson',
        data: crimeData, // Use the fetched crime data
      });

      map.addLayer({
        id: 'heatmap',
        type: 'heatmap',
        source: 'crime-data',
        layout: {
          'visibility': 'visible', // The layer will be visible by default
        },
        paint: {
          // Add your heatmap style properties here
        },
      });

      map.addLayer({
        id: 'pins',
        type: 'circle',
        source: 'crime-data',
        layout: {
          'visibility': 'none', // The layer will be hidden by default
        },
        paint: {
          // Add your pins style properties here
        },
      });
      console.log("Inside loadCrimeDataAndLayers function crimeData Count: ", crimeData.features.length);
      updateCounts(year, crimeType, crimeData);
    })
    .catch(error => {
      console.error('Error loading crime data:', error);
    });
}

function loadGangData() {
  let gangData = []; // Define gangData here if it's supposed to be local
  let dataPromise;
  console.log("Inside loadGangData function: ", gangData);
  if (gangData && gangData.length > 0) {
    // If the gang data has already been loaded, use it
    dataPromise = Promise.resolve(gangData);
  } else {
    // Otherwise, fetch it
    dataPromise = fetch('https://services2.arcgis.com/t3tlzCPfmaQzSWAk/arcgis/rest/services/2022_Gang_Boundaries/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json')
      .then(response => response.json())
      .then(gangJson => {        
        // Convert ArcGIS data format to GeoJSON format
        return {
          type: 'FeatureCollection',
          features: gangJson.features
            .filter(feature => feature.geometry && feature.geometry.rings)
            .map(feature => {
              const gangName = feature.attributes['GANG_NAME'];
              return {
                type: 'Feature',
                properties: {
                  ...feature.attributes,
                  gangName: gangName
                },
                geometry: {
                  type: 'Polygon',
                  coordinates: feature.geometry.rings.map(ring => {
                    const closedRing = [...ring, ring[0]]; // Ensure the ring is closed
                    return closedRing.map(coord => [coord[0], coord[1]]);
                  })
                }
              };
            })      
        };
      })
      .then(data => {
        gangData = data; // Update gangData with the fetched data
        // Populate the gangNames array
        gangNames = gangData.features.map(feature => feature.properties.gangName);
        console.log('gangData after conversion:', gangData);
    
        // Add the event listener for the dropdown
        document.getElementById('gang-selector').addEventListener('change', function() {
          const selectedGangName = this.value;
          if (selectedGangName) {
            // Clear any previously rendered gang layers
            map.getStyle().layers.forEach(layer => {
              if (layer.id.startsWith('gangLayer')) {
                map.removeLayer(layer.id);
              }
            });
    
            // Find and render the selected gang's layer
            const selectedGangData = gangData.features.find(feature => feature.properties.gangName === selectedGangName);
            if (selectedGangData) {
              const gangLayerId = 'gangLayer' + selectedGangName.replace(/[^a-zA-Z0-9]/g, '_');
              // Add a popup to the layer
              // Adjust the map view to fit the selected gang's territory
              const [minLng, minLat, maxLng, maxLat] = turf.bbox(selectedGangData.geometry);
              map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 20 });
            }
          }
        });
    
        return gangData;
      });
  }
  return dataPromise;
}

function addLayerVisibilityControl() {
  var displaySelect = document.getElementById('display-select');
  
  // Set the dropdown to 'heatmap' by default
  displaySelect.value = 'heatmap';

  displaySelect.addEventListener('change', function () {
    var selectedValue = displaySelect.value;
    
    // Set the visibility of the 'heatmap' layer to 'visible' if 'heatmap' is the selected option, and 'none' otherwise
    map.setLayoutProperty('heatmap', 'visibility', selectedValue === 'heatmap' ? 'visible' : 'none');
    
    // Set the visibility of the 'pins' layer to 'visible' if 'pins' is the selected option, and 'none' otherwise
    map.setLayoutProperty('pins', 'visibility', selectedValue === 'pins' ? 'visible' : 'none');
  });
}

// Global variable to keep track of the toggle state
// Global variable to keep track of the toggle state
window.togglecrime = function() {
  // Determine the selected value
  var selectedValue = document.getElementById('display-select').value;
  console.log("Inside togglecrime function: ", selectedValue);
  // Check if the selected layer exists before trying to access it
  if (map.getLayer(selectedValue)) {
    if (map.getLayoutProperty(selectedValue, 'visibility') === 'visible') {
      map.setLayoutProperty(selectedValue, 'visibility', 'none');
      return;
    } else {
      map.setLayoutProperty(selectedValue, 'visibility', 'visible');
      return;
    } 
  } else {
    console.log(`Layer ${selectedValue} does not exist.`);
  }
}

function fetchDataForYearAndCrimeType(year, crimeType) {
  console.log("Inside fetchDataForYearAndCrimeType function 329: ", year, crimeType);
  // Show the loading indicator
  loadingIndicator.style.display = 'block';

  initializeMap(year, crimeType);
    
    // If loadGangTerritories does not return a Promise, call it without .then()
//    var fetchedGangTerritoriesData = loadGangTerritories();

    // Store the fetched gang data for future use
//    if (!gangData) {
//      gangData = fetchedGangTerritoriesData;
    

    loadingIndicator.style.display = 'none';  
  };

document.addEventListener('DOMContentLoaded', (event) => {
    let allCrimeData; // Global variable to store the fetched data
 
    // Fetch the data
    fetch('https://data.cityofchicago.org/resource/ijzp-q8t2.json?$select=primary_type,date,longitude,latitude&$limit=50000')
      .then(response => response.json())
      .then(data => {
        allCrimeData = data.filter(item => item.longitude && item.latitude); // Filter out items without longitude or latitude

        // Extract the years and remove duplicates
        var years = Array.from(new Set(allCrimeData.map(item => new Date(item.date).getFullYear())));

        // Sort the years
        years.sort();

        // Get the year dropdown
        var yearDropdown = document.getElementById('year-select');

        // Remove any existing options
        while (yearDropdown.firstChild) {
          yearDropdown.firstChild.remove();
        }

        // Create an option element for each year and append it to the dropdown
        years.forEach(year => {
          var option = document.createElement('option');
          option.value = year;
          option.text = year;
          yearDropdown.appendChild(option);
        });

        // Extract the crime types and remove duplicates
        var crimeTypes = Array.from(new Set(allCrimeData.map(item => item.primary_type)));

        // Sort the crime types
        crimeTypes.sort();

        // Get the crime dropdown
        var crimeDropdown = document.getElementById('crime-select');

        // Remove any existing options
        while (crimeDropdown.firstChild) {
          crimeDropdown.firstChild.remove();
        }

        // Create an option element for each crime type and append it to the dropdown
        crimeTypes.forEach(crimeType => {
          var option = document.createElement('option');
          option.value = crimeType;
          option.text = crimeType;
          crimeDropdown.appendChild(option);
        });

        // Set the default year and crime type
        var defaultYear = 2023;
        var defaultCrimeType = 'HOMICIDE';

        // Set the selected year and crime type to the defaults
        yearDropdown.value = defaultYear;
        crimeDropdown.value = defaultCrimeType;

        // Update selectedYear and selectedCrimeType
        selectedYear = defaultYear;
        selectedCrimeType = defaultCrimeType;

        // Fetch the data for the default year and crime type
        fetchDataForYearAndCrimeType(defaultYear, defaultCrimeType);
        // updateCounts(defaultYear, defaultCrimeType);
      });

    document.getElementById('gang-selector').addEventListener('change', function() {
      const selectedGangName = this.value;
      if (selectedGangName) {
        loadGangData().then(gangData => {
          const selectedGangData = gangData.features.find(feature => feature.properties.gangName === selectedGangName);
          if (selectedGangData) {
            const [minLng, minLat, maxLng, maxLat] = turf.bbox(selectedGangData);
            map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 20 });
    
            // Clear any previously rendered gang layers
            if (map.getStyle().layers) {
              map.getStyle().layers.forEach(layer => {
                if (layer.id.startsWith('gangLayer')) {
                  map.removeLayer(layer.id);
                }
              });
            }
    
            // Render the selected gang's layer
            const sanitizedGangName = selectedGangName.replace(/[^a-zA-Z0-9]/g, '_');
            const borderLayerId = 'gangLayer' + sanitizedGangName + '-border';
            const labelLayerId = 'gangLayer' + sanitizedGangName + '-label';
    
            const filteredGangTerritoriesData = {
              ...gangData,
              features: gangData.features.filter(feature => 
                feature.properties && feature.properties.GANG_NAME && feature.properties.GANG_NAME.replace(/[^a-zA-Z0-9]/g, '_') === sanitizedGangName)
            }
            console.log("This is the filteredGangTerritoriesData", filteredGangTerritoriesData);
            // When loading the data, add a unique id to each territory
            filteredGangTerritoriesData.features.forEach((feature, index) => {
              feature.properties.id = `territory_${index}`;
            });
            
            var polygons = turf.flatten(filteredGangTerritoriesData.features[0]);
            
            polygons.features.forEach((polygon) => {
              var id = polygon.properties.id;
              var fillLayerId = `fillLayerId_${id}`;
              var borderLayerId = `borderLayerId_${id}`;
              var labelLayerId = `labelLayerId_${id}`;
            
              // Add the layer ids to the set
              layerIds.add(fillLayerId);
              layerIds.add(borderLayerId);
              layerIds.add(labelLayerId);            
              map.addLayer({
                id: fillLayerId,
                type: 'fill',
                source: {
                  type: 'geojson',
                  data: polygon
                },
                paint: {
                  'fill-color': '#888',
                  'fill-opacity': 0.4
                },
                minzoom: 0,
                maxzoom: 22
              });
            
              map.addLayer({
                id: borderLayerId,
                type: 'line',
                source: {
                  type: 'geojson',
                  data: polygon
                },
                paint: {
                  'line-color': '#FF0000', // Change the line color to red
                  'line-width': 3 // Increase the line width
                },
                minzoom: 10.5,
                maxzoom: 20
              });
            
              map.addLayer({
                id: labelLayerId,
                type: 'symbol',
                source: {
                  type: 'geojson',
                  data: turf.centroid(polygon)
                },
                layout: {
                  'text-field': ['get', 'GANG_NAME'],
                  'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                  'text-size': 16,
                  'text-allow-overlap': true,
                },
                paint: {
                  'text-color': '#000'
                },
                minzoom: 0,
                maxzoom: 22
              });
            }); 
          }
        } 
      )}
    });
    // Add an event listener to the year dropdown to update the map when the selected year changes
    document.getElementById('year-select').addEventListener('change', function() {
      selectedYear = this.value;
      fetchDataForYearAndCrimeType(selectedYear, document.getElementById('crime-select').value);
      // updateCounts(selectedYear, document.getElementById('crime-select').value);
    });

    // Add an event listener to the crime dropdown to update the map when the selected crime type changes
    document.getElementById('crime-select').addEventListener('change', function() {
      selectedCrimeType = this.value;
      fetchDataForYearAndCrimeType(document.getElementById('year-select').value, selectedCrimeType);
      // updateCounts(document.getElementById('year-select').value, selectedCrimeType);
    });
});