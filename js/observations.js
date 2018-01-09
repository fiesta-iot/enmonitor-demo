var http = require('http');
var rp = require('request-promise');
const assert = require('assert');
var io = require('socket.io');
var prettyHrtime = require('pretty-hrtime');
var _ = require('lodash');
var sizeof = require('object-sizeof');

var globals = require('./globals.js');
const endpoints = require('./endpoints');
var queries = require('./sparql-queries');
var openam = require('./openam.js');
var discovery = require('./resource-discovery');

// m3-lite:TemperatureAmbient should not be part of this
const default_phenomena_list = ['m3-lite:AmbientTemperature', 'm3-lite:AirTemperature', 'm3-lite:TemperatureSoil',
    'm3-lite:TemperatureAmbient',
    'm3-lite:Illuminance', 'm3-lite:AtmosphericPressure', 'm3-lite:RelativeHumidity',
    'm3-lite:WindSpeed', 'm3-lite:Sound', 'm3-lite:SoundPressureLevel', 'm3-lite:SoundPressureLevelAmbient', 'm3-lite:SolarRadiation',
    'm3-lite:ChemicalAgentAtmosphericConcentrationCO', 'm3-lite:ChemicalAgentAtmosphericConcentrationO3'
];

let self = module.exports = {

    last_observations: [],
    history: [],

    // Generic SPARQL for getting observations
    // Input object
    // {
    // "query": <SPARQL query (from sparql-queries.js)
    // "modifications": e.g. [{"TTTTT": 2017-08-04T10:37:55.135Z", ...}] //In case there are any replacements onto the SPARQL string    
    // }
    // Callback --> Callback to the parser function ()
    // NOTE: The callback function will always receive 
    // Output format
    // { 
    //      "status": true/false,   --> True if success, false if empty
    //      "items": [{"val": xxx, "unit": xxx, "qk": xxx, "s": xxx, "tim": xxx}],
    //      "latency": xxx 
    // }
    observationSparql: function(params, callback, callback_params) {

        observations_array = {};
        let query = params.query;
        _.forEach(params.modifications, function(item) {
            query = query.replace(item.key, item.value);
        });

        var options = {
            method: 'POST',
            uri: endpoints.sparql_execute_endpoint_global,
            resolveWithFullResponse: true,
            headers: {
                'content-type': 'text/plain',
                'accept': 'application/json',
                'iPlanetDirectoryPro': globals.iPlanetDirectoryPro
            },
            body: query
        };

        var start = process.hrtime();
        rp(options)
            .then(function(response) {

                var output = {};
                var end = process.hrtime(start);
                var latency = prettyHrtime(end, {
                    precise: false
                });

                var temp = {};
                observations_array['items'] = [];
                temp = JSON.parse(response.body).items;

                if (callback && typeof callback == "function") {
                    console.log(callback)
                    callback(self.filterData(temp))
                } else {

                }
                globals.logger.log('info', new Date().toUTCString() +
                    ' - Get Observations (all): Time %s', latency);
            })
            .catch(function(err) {
                try {
                    JSON.parse(err.error)
                    switch (JSON.parse(err.error).code) {
                        case 401:
                            console.log('Observations from SPARQL failure (401)');
                            openam.getOpenAmToken(self.observationLastValueSparql, object);
                            break;
                        default:
                            console.log("- Cannot get the observation " + err);
                    }
                } catch (e) {
                    console.log("--- Cannot get the observation " + err);
                    // openam.getOpenAmToken(self.observationLastValueSparql, object);
                }
            })
    },

    // Trim  the raw output from a SPARQL query, thus reducing the required storage demand
    // Legacy SPARQL results:
    // lat: latitude (^^http://www.w3.org/2001/XMLSchema#double) + cast to float
    // lon: longitude (^^http://www.w3.org/2001/XMLSchema#double) + cast to float
    // qk: Shorten the string by replacing the legacy prefix by m3-lite (no matter which one)
    // u: Shorten the string by replacing the legacy prefix by m3-lite (no matter which one)
    // v: value (multiple formats)
    // t: timestamp (http://www.w3.org/2001/XMLSchema#dateTime)
    // s: sensorID (nothing to trim)

    filterData: function(data) {
        _.forEach(data, function(item) {
            item.lat = parseFloat(item.lat.split('^^')[0]);
            item.lon = parseFloat(item.lon.split('^^')[0]);
            item.t = new Date(item.t.split('^^')[0]);
            item.qk = item.qk.replace(item.qk.split('#')[0] + '#', 'm3-lite:');
            item.u = item.u.replace(item.u.split('#')[0] + '#', 'm3-lite:');
            // Cast to the corresponding output format
            if (item.v.search('double') || item.v.search('float')) {
                item.v = parseFloat(item.v.split('^^')[0]);
            } else if (item.v.search('dateTime')) {
                item.v = new Date(item.v.split('^^')[0]);
            } else {
                item.v = item.v.split('^^')[0];
            }
        });

        return data;
    },

    // Upon an individual marker click, send back the last value observed by the sensor
    getLastValue: function(data) {
        let output = {};
        let items = [];
        let status = false;

        const start = process.hrtime();
        _.forEach(data.value, function(o) {
            let hit;
            status = true;

            if (hit = _.find(self.last_observations, {
                    's': o
                })) {
                items.push({
                    long: hit.lon,
                    lat: hit.lat,
                    qk: hit.qk,
                    unit: hit.u,
                    value: hit.v,
                    s: hit.s,
                    timestamp: hit.t
                })
            }
        });
        var end = process.hrtime(start);

        output['latency'] = prettyHrtime(end, {
            precise: false
        });
        output['status'] = status;
        output['items'] = items;

        globals.socket.emit('last_observation_resp', output);
    },

    // Parse the response from the generic SPARQL query
    getLastValues: function(data) {
        let hit;
        const aux = _.uniqBy(data, 's'); // This should take the most recent observation for each sensor
        _.forEach(aux, function(item) {
            var hit = _.findIndex(self.last_observations, {
                's': item.s
            });
            if (hit >= 0) {
                // Update if the timestamp is more recent                 
                if (new Date(item.t) > new Date(self.last_observations[hit].t)) {
                    self.last_observations[hit] = item;
                }
            } else {
                self.last_observations.push(item);
            }
        });
        console.log('--- ' + self.last_observations.length);

        // Update the historical data
        _.forEach(data, function(o) {
            if (hit = _.find(self.history, {
                    's': o.s,
                    't': o.t
                })) {
                // console.log('Element repeated');
            } else {
                self.history.push(o);
            }

        });
    },

    observationsGetAll: function() {
        globals.socket.emit('observations_get_all_resp', self.last_observations);
    },

    filterHistoricData: function(phenomenon, bounds) {

        let output = [];

        let last_24 = new Date();
        last_24.setMinutes(last_24.getMinutes() - 1440);

        const filter = _.filter(self.history, function(item) {
            return ((item.qk === 'm3-lite:' + phenomenon) &&
                (item.lat >= bounds._southWest.lat) &&
                (item.lat <= bounds._northEast.lat) &&
                (item.lon >= bounds._southWest.lng) &&
                (item.lon <= bounds._northEast.lng) &&
                ((item.t >= last_24)))
        });

        _.forEach(filter, function(o) {

            const aux = new Date(o.t.getFullYear(), o.t.getMonth(), o.t.getUTCDate(), o.t.getHours(), 0, 0);

            output.push({
                // t: o.t.getHours(),
                t: o.t, // Raw time
                // t: format('yy/MM/dd-hh', aux), //Truncate to hour
                v: o.v
            })
        });

        globals.socket.emit('get_history_resp', output);
    },

    // Daily cleaning up of the history 
    cleanup: function() {
        console.log(new Date().toUTCString() + ' - Repo cleanup');
    }

};