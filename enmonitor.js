// Server and Socket.io legacy initialization
var exp = require('express')
var express = exp();
var app = require('http').Server(express);
var morgan = require('morgan');
var winston = require('winston');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var io = require('socket.io');
// var Promise = require('bluebird');

// Internal packages
const discovery = require('./js/resource-discovery');
var globals = require('./js/globals');
var io = require('./js/sockets.js');
var schedule = require('./js/schedule');
// var openam = require('./js/openam.js');

express.use(exp.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
express.use('bower_components', exp.static(__dirname + '/public/bower_components'));
express.use('node_modules', exp.static(__dirname + '/node_modules'));
express.use('lib', exp.static(__dirname + '/public/lib'));
express.use('images', exp.static(__dirname + '/public/images'));
express.use(morgan('dev')); // log every request to the console

express.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
express.use(bodyParser.json()); // parse application/json
express.use(favicon(__dirname + '/public/images/favicon.ico'));

// listen (start app with node server.js) ======
var server = express.listen(globals.port);

express.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

//  ------- SOCKET.IO HANDLING -------
io.startSocketIo(server);

// -------- SCHEDULER
schedule.init();

//  ------- LOGGING (WINSTON) -------
globals.logger.log('info', new Date().toUTCString() + ' - Server started (Port ' + globals.port + ')');

// CTRL+C signal handler
process.on('SIGINT', function() {
    io.close();
    server.close();
    process.exit();
});