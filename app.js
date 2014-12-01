
var express = require('express');
var config = require('./config/config');
var Waterline = require('waterline');
var passport = require('passport');

var app = express();

app.set('port', config.port);

app.config = config; // add config application object to express app (to avoid singleton of config)
app.logger = require('./config/logger')(app); // Get and create first time logger object


// Instantiate a new instance of the ORM
var orm = new Waterline();


/*
 * Load the Waterline Models
 */
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

    // Bootstrap passport config
    require('./config/passport')(app, passport, config);
    app.logger.debug('Passport module has been loaded');

    // Bootstrap application settings
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
    require('./config/routes')(app, passport, config);
    app.logger.debug('Routes configuration loaded');

    // Start Server
    var server = app.listen(app.get('port'), function() {
        app.logger.info('Express server listening on port ' + server.address().port);
    });
});

/**
 * Expose
 */

module.exports = app;