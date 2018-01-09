var globals = require('./globals.js');

module.exports = {        

    resources_endpoint : globals.config.iot_registry + '/resources',
    observations_endpoint : globals.config.iot_registry + '/observations',       
    sparql_execute_endpoint: globals.config.iot_registry + '/queries/execute/resources',    
    sparql_execute_endpoint_global: globals.config.iot_registry + '/queries/execute/global',

    // openam_authentication_endpoint: 'https://platform.fiesta-iot.eu/openam/json/authenticate',
    // openam_authentication_endpoint: 'https://platform.fiesta-iot.eu/openam/json/authenticate',
    
};

