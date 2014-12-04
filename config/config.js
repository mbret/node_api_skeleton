
/**
 * Module dependencies.
 */
//var _ = require('lodash');
var path = require('path');
var extend = require('util')._extend;
var winston = require('winston');
var development = require('./env/development');
var production = require('./env/production');
// Require any waterline compatible adapters here
var diskAdapter = require('sails-disk');

var root = path.normalize(__dirname + '/..');


var defaults = {
    root: root,

    env: process.env.NODE_ENV || 'development',

    port: process.env.PORT || 3000,

    notifier: {
        service: 'postmark',
        APN: false,
        email: true, // true
        actions: ['comment'],
        tplPath: path.normalize(__dirname + '/../app/mailer/templates'),
        key: 'POSTMARK_KEY'
    },

    // Logs use winston
    log: {
        transports: [
//            new winston.transports.File({
//                level: 'debug',
//                filename: root + '/data/logs/logs.log',
//                handleExceptions: true,
//                json: false,
//                maxsize: 5242880, //5MB
//                maxFiles: 5,
//                colorize: false
//            }),
            new winston.transports.Console({
                level: 'debug',
                handleExceptions: false,
                json: false,
                colorize: true
            })
        ]
    },

    views: {
        engine: 'swig',
        path: root + '/app/views',
        assets: {
            path: root + '/public/assets'
        }
    },

    responses: {
        path: root + '/app/responses'

    },

    models: {
        path: root + '/app/models'
    },

    session: {
        secret: 'a05a8ds39d9524adfc77359b58e8792d'
    },

    plugins: {
        path: root + '/app/plugins'
    },

    controllers: {
        path: root + '/app/controllers'
    },

    // ORM configuration
    waterline: {
        // Setup Adapters
        // Creates named adapters that have have been required
        adapters: {
            'default': diskAdapter,
            disk: diskAdapter
        },

        // Build Connections Config
        // Setup connections using the named adapter configs
        connections: {
            myLocalDisk: {
                adapter: 'disk'
            }
        },

        defaults: {
            migrate: 'drop'
        }
    }
};


/**
 * Expose
 */

module.exports = {
    development: extend(defaults, development),
    production: extend(defaults, production)
}[process.env.NODE_ENV || 'development'];