// Icon configuration
var blueIcon = new L.icon(default_markers_json);
var redIcon = new L.Icon(selected_markers_json);

// Array & layer to display the nodes 
var devices_layer = new L.layerGroup();
var devices_cluster = new L.MarkerClusterGroup({
    // showCoverageOnHover: true,
    // disableClusteringAtZoom: 18,
    maxClusterRadius: 30,
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: true
});

var heatmap_layer;

function initMap() {
    // set up the map
    leafletMap = L.map('mapid', {
        center: [initialLatitude, initialLongitude],
        zoom: initialZoom,
        maxZoom: 18,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: false,
        worldCopyJump: true,
        keyboard: true,
        keyboardZoomOffset: true,
    });

    // Basic Map Style
    L.mapbox.accessToken = mapbox_access_token;
    var baseMap = L.tileLayer('https://api.mapbox.com/styles/v1/' + mapbox_style + '/tiles/{z}/{x}/{y}?access_token=' +
            L.mapbox.accessToken, {
                noWrap: false,
                // tileLayer: {format: 'jpg70'},   //Low bandwidth map
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            })
        .addTo(leafletMap);

    // Base control layers (updated with Styled layer control)
    var baseLayers = {
        "Base map": baseMap
    };

    heatmap_layer = new HeatmapOverlay(heatmap_cfg);

    var overlays = {
        "Clusters": devices_cluster,
        "Nodes": devices_layer,
    };

    // Legacy layer control 
    L.control.layers(baseLayers, overlays).addTo(leafletMap);

    // Draw Control initialization function
    // drawControl();

    // Default events (loaded at map initialization)
    leafletMap.on('click', function(e) {
        // console.log("Clicked location: [" + e.latlng.lat + ", " + e.latlng.lng + "]");
        // console.log("Value: " + heatmap_layer._heatmap.getValueAt({
        //     x: e.latlng.lat,
        //     y: e.latlng.lng
        // }));
    });

    leafletMap.on('dblclick', restoreView);

    // Event on 'move' end. Alternatively, run it to 'move' (and optimize the deep iteration method)
    leafletMap.on('load', onMoveend);

    leafletMap.on('moveend', onMoveend);
    leafletMap.on('zoomend', onZoomend);

    // Control layers handlers 
    leafletMap.on('overlayadd', function(event) {
        if (event.name === 'Clusters') {
            active_clusters_overlay = true;
            devices_cluster.addTo(leafletMap);
        } else if (event.name === "Nodes") {
            active_nodes_overlay = true;
            devices_layer.addTo(leafletMap);
        } else if (event.name === "Heatmap") {
            active_heatmap_overlay = true;
            heatmap_layer.addTo(leafletMap);
        }
    })

    leafletMap.on('overlayremove', function(event) {
        if (event.name === 'Clusters') {
            active_clusters_overlay = false;
            leafletMap.removeLayer(devices_cluster);
        } else if (event.name === "Nodes") {
            active_nodes_overlay = false;
            leafletMap.removeLayer(devices_layer);
        } else if (event.name === "Heatmap") {
            active_heatmap_overlay = false;
            leafletMap.removeLayer(heatmap_layer);
        }
    })

    leafletMap.on('mousemove', function(event) {
        if (active_heatmap_overlay === true) {
            onMouseMove(event);
        }
    });

    // Scale marker
    L.control.scale().setPosition('bottomleft').addTo(leafletMap);

    // By default, we will load the cluster option
    devices_cluster.addTo(leafletMap);

    //Resource discovery phase    
    socket.emit('resource_discovery_req');
    socket.emit('gather_stats_req');
    // Get all observations
    socket.emit('observations_get_all');

};

// Initial resource discovery. Parameters:
// type: global/local/remote
// query_parameters: { 'phenomena': [],
//         'location': { 'type': 'rectangle',
//                     'values': []
//        }
// }
// Todo: the location based discovery will be left for a future version

function discovery(type, query_parameters) {
    if (type === 'global') {
        devices_array = [];
        devices_cluster.clearLayers();
        devices_layer.clearLayers();
        socket.emit('resource_discovery_req');
        socket.emit('gather_stats_req');
    } else if (type === 'local') {
        localResourceDiscovery(query_parameters)
    } else { //SPARQL query
        devices_array = [];
        devices_cluster.clearLayers();
        devices_layer.clearLayers();
        socket.emit('resource_discovery_req', query_parameters);
        socket.emit('gather_stats_req');
    }
};

function localResourceDiscovery(query_parameters) {

    // Create a deep copy
    var copy = [];

    _.forEach(devices_array, function(o) {
        copy.push(JSON.parse(JSON.stringify(o.marker.options.alt)));
    });

    var start = performance.now();
    // Clear layers    
    devices_cluster.clearLayers();
    devices_layer.clearLayers();

    var output_array = _.filter(copy, function(device) {
        _.remove(device.sensors, function(o) {
            var aux = o.qk.replace('http://purl.org/iot/vocab/m3-lite#', 'm3-lite:');
            return _.indexOf(query_parameters.phenomena, aux) < 0;
        });

        return device.sensors.length > 0;
    });

    _.forEach(output_array, function(device) {
        var marker = L.marker(device.location, {
                riseOnHover: false,
                dragging: false,
                title: '', //Trick to add a name to the marker (I)                         
                alt: device
            }).on('click', onMarkerClick)
            .addTo(devices_cluster)
            .addTo(devices_layer)
    });
    var stop = performance.now();
};


// Parse the resource discovery options
function parseResourceDiscoveryData(data) {
    var hit;


    _.forEach(data.items, function(o) {
        hit = _.find(devices_array, {
            // 'device': o.dev
            'location': [o.lat.split('^^')[0], o.long.split('^^')[0]]
        })

        if (hit === undefined) {

            var marker = L.marker([o.lat, o.long], {
                    riseOnHover: false,
                    dragging: false,
                    title: o.id, //Trick to add a name to the marker (I)                         
                    alt: {}
                }).on('click', onMarkerClick)
                .addTo(devices_cluster)
                .addTo(devices_layer)
                // .bindPopup(popup_text, popup_options);

            var aux = {};
            // aux['device'] = o.dev;
            aux['location'] = [parseFloat(o.lat.split('^^')[0]), parseFloat(o.long.split('^^')[0])]
            aux['sensors'] = [];
            aux['selected'] = false;
            aux['visible'] = true;

            var aux2 = {};

            aux2['id'] = o.sensor;

            if (_.has(o, 'endp')) {
                aux2['endpoint'] = o.endp;
            }

            aux2['qk'] = o.qk;
            aux2['unit'] = o.unit;
            aux['sensors'].push(aux2);


            marker.options.alt = aux;
            devices_array.push({
                // 'device': o.dev,
                'location': [o.lat.split('^^')[0], o.long.split('^^')[0]],
                'marker': marker
            });

        } else {
            var aux = {};
            aux['id'] = o.sensor;
            if (_.has(o, 'endp')) {
                aux['endpoint'] = o.endp;
            }
            aux['qk'] = o.qk;
            aux['unit'] = o.unit;
            hit.marker.options.alt.sensors.push(aux);
        }
    });

    if (active_clusters_overlay === true) {
        devices_cluster.addTo(leafletMap);
    }
    if (active_nodes_overlay === true) {
        devices_layer.addTo(leafletMap)
    }
    if (active_heatmap_overlay === true) {
        heatmap_layer.addTo(leafletMap)
    }

    total_nodes = devices_array.length;

};

function getAllObservations() {
    socket.emit('observations_get_all');
};

// Two input parameters:
// 1- Leaflet marker
// 2- Array
function getLastObservation(marker) {

    sensors_array = [];

    _.forEach(marker.options.alt.sensors, function(item) {
        sensors_array.push(item.id);
    });

    socket.emit('last_observation', {
        'type': 'marker',
        'value': sensors_array
    });
};

function TaxonomyConverter(dictionary, value) {
    return taxonomy_converter[dictionary][value] != undefined ? taxonomy_converter[dictionary][value] : value;
};

function showNodeInfo(event) {

    event.relatedTarget.bindPopup('<table id=\"test\" class=\"display\"><thead><tr><th>#<\/th>\<th>QK<\/th><th>Unit<\/th><th>Endpoint<\/th><\/tr><\/thead><\/table>', {
        'minWidth': 400,
        'maxWidth': 600
    }).openPopup();
    $('#test').DataTable({
        'bPaginate': false,
        'bFilter': false,
        'bLengthChange': false,
        'retrieve': false,
        'ordering': false,
        'bInfo': false,
        'autoWidth': false,
        'columns': [{
            'orderable': false,
            'width': 10,
        }, {
            'orderable': false,
            'width': 140,
        }, {
            'orderable': false,
            'width': 140,
        }, {
            'orderable': false,
            'width': 30,
        }]
    });

    var counter = 0;

    _.forEach(event.relatedTarget.options.alt.sensors, function(o) {

        getDataTable('#test').row.add(['\<a href=\"' + o.id + '\" target=\"_blank\"\>' + counter + '\<\/\a>',
            o.qk.split('#')[1],
            o.unit.split('#')[1],
            _.has(o, 'endpoint') ? '\<a href=\"' + o.endpoint.split('^^')[0] + '\" target=\"_blank\"\> Endpoint \<\/\a>' : '--'
        ]).draw().node();
        counter++;
    });

    event.relatedTarget.unbindPopup();
}


function WeatherStationAverage(data) {

    var weather_station = {};

    var start = performance.now();
    _.forEach(data.items, function(o) {
        if (!_.has(weather_station, o['qk'])) {
            weather_station[o['qk']] = []
        }
        weather_station[o['qk']].push(o.value);
    });

    _.forEach(_.keys(weather_station), function(o) {
        $('#weather_' + o.split(':')[1]).html(math.mean(weather_station[o]).toFixed(3))
    });
    var stop = performance.now()

}