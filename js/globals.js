// Configuration file handling
var path = require('path');
var yaml_config = require('node-yaml-config');
var winston = require('winston');

module.exports = {

    // Configuration file load  (Default source: production) --> Check ../config/config.yaml file
    config: yaml_config.load(path.join(__dirname, '..', 'config', 'config.yaml'), 'test'),

    // Server init
    port: process.env.PORT || 3000, // set the port    
    socket: '', //Socket IO identifier (to be filled at app bootstrap)
    logger: new winston.Logger({
        // level: 'info',
        transports: [
            new(winston.transports.Console)(),
            new(winston.transports.File)({
                filename: 'logs/logging.log'
            })
        ]
    }),

    // Performance metrics
    resource_discovery: [],

    // Open AM token
    iPlanetDirectoryPro: '',

    // Function that return true if the base host is https; false otherwise 
    // No need to implement it in production mode
    IsHttps: function() {
        return this.config.iot_registry.indexOf("https") === 0;
    },

    // Tasks periodicity (in minutes)
    observations_window: 10,

}