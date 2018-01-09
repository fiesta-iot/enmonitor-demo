var taxonomy_converter = {
    'qk': {
        'BatteryLevel': 'Battery',
        'AirTemperature': 'Temperature',
        'Illuminance': 'Light',
        'AtmosphericPressure': 'Atm. pressure',
        'RelativeHumidity': 'Humidity',
        'TemperatureAmbient': 'Temperature',
        'SoundPressureLevel': 'Noise',
        'SoundPressureLevelAmbient': 'Noise',
        'SpeedInstantaneous': 'Speed (inst)',
        'ChemicalAgentAtmosphericConcentrationO3': 'O3',
        'ChemicalAgentAtmosphericConcentrationNO2': 'NO2',
        'ChemicalAgentAtmosphericConcentrationCO': 'CO',
        'ChemicalAgentAtmosphericConcentrationAirParticles': 'Air Particles',
        'MileageTotal': 'Mileage (tot)',
        'Altitude': 'Altitude',
        'PositionLongitude': 'Longitude',
        'PositionLatitude': 'Latitude',
        'DirectionAzimuth': 'Azimuth',
        'SoilMoistureTension': 'Humidity (soil)',
        'TemperatureSoil': 'Temp. (soil)',
        'SolarRadiation': 'Solar radiation',
        'WindSpeed': 'Wind speed'
    },

    'unit': {
        'DegreeCelsius': 'ºC',
        'Percent': '%',
        'Lux': 'lux',
        'DecibelA': 'dB',
        'KilometrePerHour': 'km/h',
        'MilligramPerCubicMetre': 'mg/m^3',
        'MicrogramPerCubicMetre': 'ug/m^3',
        'DegreeAngle': 'º',
        'Metre': 'm',
        'MeterPerSecond': 'm/s',
        'WattPerSquareMetre': 'W/m^2',
        'Scale': '',
        'Index': '',
        'Millibar': 'mBar'
    }
}

// GeoJSON styles
var geojson_nodes_style = {
    "color": "#ff7800",
    "marker-color": "#EE7600",
    "marker-size": "large",
    "marker-symbol": "city",
    "weight": 5,
    "opacity": 0.65
};

var getShapeType = function(layer) {

    if (layer instanceof L.Circle) {
        return 'circle';
    }

    if (layer instanceof L.Marker) {
        return 'marker';
    }

    if ((layer instanceof L.Polyline) && !(layer instanceof L.Polygon)) {
        return 'polyline';
    }

    if ((layer instanceof L.Polygon) && !(layer instanceof L.Rectangle)) {
        return 'polygon';
    }

    if (layer instanceof L.Rectangle) {
        return 'rectangle';
    }
};

function layerToGeoJSON(layer) {
    var features = [];
    layer.eachLayer(collect);

    function collect(l) {
        if ('toGeoJSON' in l) features.push(l.toGeoJSON());
    }
    return {
        type: 'FeatureCollection',
        features: features
    };
}

function geojsonToLayer(geojson, layer) {
    // layer.clearLayers();
    L.geoJson(geojson, {
        style: L.mapbox.simplestyle.style,
        pointToLayer: function(feature, latlon) {
                if (!feature.properties) feature.properties = {};
                return L.mapbox.marker.style(feature, latlon);
            }
            // 
            // onEachFeature: function
            // 
    }).eachLayer(add);

    function add(l) {
        bindPopup(l);
        l.addTo(layer);
    }
}