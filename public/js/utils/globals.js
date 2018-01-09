// Global variables 
var leafletMap;

// Local/remote server. Uncomment the actual deployment
// Server on a localhost basis

// Localhost
var serverEndpoint = 'http://localhost:3000';
var socket = io.connect(serverEndpoint);
// Remote address
// var serverEndpoint = 'http://fiesta-iot.tlmat-unican.es/';
// var socket = io.connect(serverEndpoint, {
//     path: '/enmonitor-demo/socket.io'
// });

// Map handlers
var mapInstance;
var initialLatitude = 48;
var initialLongitude = 40;
var initialZoom = 2;

// Array that holds all assets info
var devices_array = [];

// Active overlay indicators, displaying whether these layers are active or not
var active_clusters_overlay = true;
var active_nodes_overlay = false;
var active_heatmap_overlay = false;

// Stats
var total_nodes = 0
var selected_nodes = 0

// Layer arrays
// var selected_markers_array = [];
var phenomena_dictionary = [""];

var default_markers_json = {
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    // iconUrl: 'images/icons/raw/roadOccupancy.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
}

var selected_markers_json = {
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    // iconUrl: 'images/icons/raw/roadOccupancy.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
}

// Popup options
var popup_options = {
    // 'maxWidth': 'auto'
    'maxWidth': 600,
    'closeOnClick': true
}

// Phenomena toggle buttons
var phenomena_toggle_group = []

// Last observations
var last_observations_array = []

const phenomenon_uom = {
    'Air Temperature': 'ºC',
    'Illuminance': 'Lux',
    'Atmospheric Pressure': 'mBar',
    'Relative Humidity': '%',
    'Windspeed': 'km/h',
    'Sound (noise)': 'km/h',
    'Solar radiation': 'W/m^2',
    'O3 concentration': 'ug/m^3',
    'CO concentration': 'mg/m^3'
}