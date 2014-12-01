var winston = require('winston');
winston.emitErrs = true;

var logger = function( app ) {

    // app contain express app
    return new winston.Logger({
        transports: app.config.log.transports,
        exitOnError: false
    });
}

module.exports = logger;