var _ = require('lodash');
var socketio = require('socket.io');
var globals = require('./globals');
var discovery = require('./resource-discovery');
var observations = require('./observations');
var openam = require('./openam');

let io;

module.exports = {

    startSocketIo: function(server) {

        io = socketio.listen(server);
        io.sockets.on('connection', function(socket) {

            globals.socket = socket;

            let handshake = socket.handshake;
            console.log('IP address from handshake ' + handshake.address + " - " + handshake.url);

            // Raw resource discovery (no input parameters) or phenomena/location-based SPARQL queries
            socket.on('resource_discovery_req', function(data) {
                // No external parameters, no need for a new SPARQL and hence, we return the whole set of resources
                if (data === undefined) {
                    socket.emit('resource_discovery_resp', discovery.getAllResources());
                } else {
                    discovery.sparqlDiscovery(data);
                }
            })

            socket.on('gather_stats_req', function(object) {
                socket.emit('gather_stats_resp', discovery.getStats());
            })

            socket.on('resource_latency_req', function() {
                socket.emit('resource_latency_resp', _.last(globals.resource_discovery));
            })

            socket.on('mapbox_credentials_request', function() {
                socket.emit('mapbox_credentials_response', {
                    'style': globals.config.mapbox_style,
                    'token': globals.config.mapbox_access_token
                });
            })

            socket.on('last_observation', function(object) {
                observations.getLastValue(object);
            })

            socket.on('observations_get_all', function(object) {
                observations.observationsGetAll(object);
            })

            socket.on('get_history_req', function(object) {
                observations.filterHistoricData(object.phenomenon, object.bounds);
            })

            socket.on('clientLogging', function(msg) {
                globals.logger.log('info', new Date().toUTCString() + ' - ' + msg);
            })

            socket.on('disconnect', function() {
                io.sockets.emit('user disconnected');
            });

        });
    },

    update: function() {
        console.log(new Date().toUTCString() + " - broadcast sent " + io.engine.clientsCount);
        io.sockets.emit('bcast');
        // Broadcast resources and statistics
    },

    close: function() {
        // OpenAM logout
        if (globals.IsHttps()) {
            openam.logoutOpenAm();
        }
        io.sockets.emit('server_close');
    }

};