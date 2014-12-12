var express = require('express'); // Express app
var config = require('./config/config'); // App config
var Waterline = require('waterline'); // ORM
var passport = require('passport'); // Authentication module
var async = require('async');

// Create app
var app = express();

app.set('port', config.port);
app.config = config; // add config application object to express app (to avoid singleton of config)

// LOGGER
// This require will require one time winston and add loggers that habe been configured in /config
// app.logger = require('./config/logger')(app);
// Winston is deactivated for now because of problem to display errors
app.logger = console;
app.logger.debug = console.log;
app.logger.warn = console.log;
app.logger.info = console.log;

// Instantiate a new instance of the ORM
var orm = new Waterline();

// Load the Waterline Models
require('fs').readdirSync( config.models.path ).forEach(function (file) {
    if (~file.indexOf('.js')){
        orm.loadCollection( require( config.models.path + '/' + file) )
    }
});
app.logger.debug('Waterline models has been loaded');

// Start Waterline passing adapters in
orm.initialize( app.config.waterline , function(err, models) {
    if(err) throw err;

    app.models = models.collections;
    app.connections = models.connections;


    async.series([

            function(cb){
                // Custom callback call
                // This callback only take app and callback as parameter
                // We can init some stuff like piece of config or database
                require('./config/bootstrap')(app, cb);
            },

            function(cb){
                // Express response object injection
                // Injection of responses
                // Check all files in responses and add the first method (with name as index) to
                // response object
                // ex /responses/sendOk.js with exports.ok = ... will give res.ok(..);
                require('fs').readdirSync( app.config.responses.path ).forEach(function (file) {
                    if (~file.indexOf('.js')){
                        var exported = require(config.responses.path + '/' + file);
                        app.response[exported.name] = exported;
                    }
                });


                // Bootstrap application settings
                // This config init all middleware of the express app
                // Use this config file
                require('./config/express')(app, passport, config);
                app.logger.debug('Express application configuration done');

                // Inject plugins
                app.plugins = {};
                require('fs').readdirSync( config.plugins.path ).forEach(function (file) {
                    if (~file.indexOf('.js')){
                        var pluginName = file.substr(0, file.length - '.js'.length);
                        var plugin = require( config.plugins.path + '/' + file);
                        app.use( plugin.dispatch );
                        app.plugins[pluginName] = plugin;
                    }
                });
                app.logger.debug('Plugins loaded');

                // Bootstrap routes
                // load controllers
                var controllers = {};
                require('fs').readdirSync( config.controllers.path ).forEach(function (file) {
                    if (~file.indexOf('.js')){
                        var controllerName = file.substr(0, file.length - '.js'.length);
                        var controller = require( config.controllers.path + '/' + file );
                        controllers[controllerName] = controller;
                    }
                });
                require('./config/routes')(app, passport, controllers);
                app.logger.debug('Routes configuration loaded');

                // Start Server
                var server = app.listen(app.get('port'), function() {
                    app.logger.info('Express server listening on port ' + server.address().port);
                });
            }
        ],
        function(err){
            if(err) app.logger.error( err );
            // end
        }
    );

});

/**
 * Expose
 */

module.exports = app;