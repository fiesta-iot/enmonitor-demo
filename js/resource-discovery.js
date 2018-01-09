var http = require('http');
var rp = require('request-promise');
const assert = require('assert');
var _ = require('lodash');
var io = require('socket.io');
var prettyHrtime = require('pretty-hrtime');
var sizeof = require('object-sizeof');

var globals = require('./globals');
var queries = require('./sparql-queries');
const endpoints = require('./endpoints');
var openam = require('./openam');

// m3-lite:TemperatureAmbient should not be part of this
const default_phenomena_list = ['m3-lite:AirTemperature', 'm3-lite:TemperatureSoil', 'm3-lite:BuildingTemperature',
    'm3-lite:TemperatureAmbient',
    'm3-lite:Illuminance', 'm3-lite:AtmosphericPressure', 'm3-lite:RelativeHumidity',
    'm3-lite:WindSpeed', 'm3-lite:Sound', 'm3-lite:SoundPressureLevel', 'm3-lite:SoundPressureLevelAmbient', 'm3-lite:SolarRadiation',
    'm3-lite:ChemicalAgentAtmosphericConcentrationCO', 'm3-lite:ChemicalAgentAtmosphericConcentrationO3'
];

let self = module.exports = {
    //Gathers all the resources (having at least a sensor of the above list)
    resources: {},
    // Gathers main statistics from 
    stats: {},

    sparqlDiscovery: function(query_parameters) {
        var query;
        query_parameters === undefined ?
            query = queries.resource_discovery.replace('VVVVV', default_phenomena_list.join(" ")) :
            query = queries.resource_discovery.replace('VVVVV', query_parameters['phenomena'].join(" "));
        var options = {
            method: 'POST',
            uri: endpoints.sparql_execute_endpoint,
            // uri: endpoints.fiesta_testing_sparql_execute_endpoint,
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
                var temp = {};
                var end = process.hrtime(start);
                var latency = prettyHrtime(end, {
                    precise: false
                });

                temp = JSON.parse(response.body);

                globals.logger.log('info', new Date().toUTCString() +
                    ' - Resource discovery (total): Time %s # %d', latency, temp.items.length);
                // Array to monitor timings
                globals.resource_discovery.push({
                    "date": new Date().toISOString(),
                    "latency": latency,
                    "resources": temp.items.length
                });

                if (query_parameters === undefined) {
                    self.resources = temp;
                } else {
                    // Fix socket visibility in multiple files (Node JS)
                    globals.socket.emit('resource_discovery_resp', temp);
                }
                self.gatherStats();
            })
            .catch(function(err) {

                try {
                    var message = JSON.parse(err.error)
                    switch (JSON.parse(err.error).code) {
                        case 401:
                            console.log('Resource discovery failure (401) --- ' + message);
                            getOpenAmToken(this)
                            break;
                        default:
                            console.log("Resource discovery failure --  " + err);
                    }
                } catch (e) {
                    console.log("Resource discovery failure - " + err);
                    openam.getOpenAmToken(self.sparqlDiscovery, query_parameters);
                }
            })
    },

    getAllResources: function() {
        var output;
        _.isEmpty(self.resources) ? output = {} : output = self.resources;

        console.log("SIZE " + sizeof(output))

        return output;
    },

    gatherStats: function() {

        var output = {};
        var options = {
            method: 'POST',
            uri: endpoints.sparql_execute_endpoint_global,
            // uri: endpoints.fiesta_testing_sparql_execute_endpoint,
            resolveWithFullResponse: true,
            headers: {
                'content-type': 'text/plain',
                'accept': 'application/json',
                'iPlanetDirectoryPro': globals.iPlanetDirectoryPro
            },
            body: queries.tally
        };

        var start = process.hrtime();
        rp(options)
            .then(function(response) {


                var end = process.hrtime(start);
                var latency = prettyHrtime(end, {
                    precise: false
                });

                globals.logger.log('info', new Date().toUTCString() +
                    ' - Gather stats (total): Time %s ', latency);

                self.stats['latency'] = latency;

                var temp = JSON.parse(response.body);
                temp = _.head(temp.items);

                _.forEach(_.keys(temp), function(item) {
                    self.stats[item] = temp[item].split('^^')[0];
                });
            })
            .catch(function(err) {
                try {
                    var message = JSON.parse(err.error)
                    switch (JSON.parse(err.error).code) {
                        case 401:
                            console.log('Gather stats failure (401) - ' + message);
                            getOpenAmToken(this)
                            break;
                        default:
                            console.log("Gather stats failure -" + message);
                    }
                } catch (e) {
                    console.log("Gather stats failure -" + err);
                    openam.getOpenAmToken(self.gatherStats);
                }
            })
    },

    getStats: function() {
        var output;
        _.isEmpty(self.stats) ? output = {} : output = self.stats
        return output;
    },

    // From the array of the last observations, update the positions of the mobile devices (if any)
    updatePositions: function(last_observations) {

    }

};