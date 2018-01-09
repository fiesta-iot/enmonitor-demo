var _ = require('lodash');
var prettyHrtime = require('pretty-hrtime');
var sizeof = require('object-sizeof');
var cron = require('node-cron');
var globals = require('./globals');
var queries = require('./sparql-queries');
var openam = require('./openam');
var observations = require('./observations');
const discovery = require('./resource-discovery');
var io = require('./sockets');

let self = module.exports = {

    tasks: [],

    // List of tasks
    // 1- 25 minutes: OpenAM token renewal
    // 2- 60 minutes: Resource discovery 
    // 3- 10 minutes: Get observations
    // 4- 5 minutes: Broadcast resources and observations to all active clients
    // 5- 60 minutes: Store only the values that correspond to 1 hour-window
    // 6- 24 hours: Observations history clean-up

    init: function() {

        // Check if the platform uses OpenAM or not
        if (globals.IsHttps()) {
            // Get the promises from             
            openam.getOpenAmToken(discovery.sparqlDiscovery);
            openam.getOpenAmToken(self.scheduleObservationWindow, 1440);
        } else {
            // First run of the functions            
            discovery.sparqlDiscovery();
            self.scheduleObservationWindow(1440);
        }

        cron.schedule('0 * * * *', function() {
            console.log(new Date().toUTCString() + ' - Resource discovery');
            discovery.sparqlDiscovery()
        });

        cron.schedule('1,11,21,31,41,51 * * * *', function() {
            self.scheduleObservationWindow();
        });

        cron.schedule('* 12 * * *', function() {
            io.update();
        });

        cron.schedule('* 0 * * *', function() {
            observations.cleanup();
        });

        // Run tasks at t=0
        _.forEach(self.tasks, function(o) {
            o.start();
        });
    },

    // Special case for the first iteration, where we retrieve the last 24 hours (i.e. 1440 minutes)
    scheduleObservationWindow: function(minutes = 0) {
        let from = new Date();
        from.setMinutes(from.getMinutes() - (minutes != 0 ? minutes : globals.observations_window));

        observations.observationSparql({
                query: queries.observation_window,
                modifications: [{
                    key: "TTTTT",
                    value: from.toISOString()
                }]
            },
            observations.getLastValues
        );
    }
}