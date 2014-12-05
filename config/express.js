
/**
 * Module dependencies.
 */

var express = require('express');
var session = require('express-session');
var compression = require('compression');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');

// Express body-parser. This module has be taken out express to act as standalone
// Use it ton inject in req.body (post/put/... form data / url encoded / etc)
var bodyParser = require('body-parser');

// Multer is a node.js middleware body parser for handling multipart/form-data.
var multer = require('multer');

// Express body-parser (only for post/put/... raw content)
var getRawBody  = require('raw-body');

var methodOverride = require('method-override');

var swig = require('swig');
var flash = require('connect-flash');



/**
 * Expose
 */

module.exports = function (app, passport, config) {

    // Inject some information about the response
    app.use(function(req, res, next){
        var accept = req.get('Accept') || '';
        // Flag indicating whether HTML was explicitly mentioned in the Accepts header
        req.explicitlyAcceptsHTML = (accept.indexOf('html') !== -1);

        // Flag indicating whether a request would like to receive a JSON response
        //
        // This qualification is determined based on a handful of heuristics, including:
        // • if this looks like an AJAX request
        // • if this is a virtual request from a socket
        // • if this request DOESN'T explicitly want HTML
        // • if this request has a "json" content-type AND ALSO has its "Accept" header set
        // • if this request has the option "wantsJSON" set
        // req.wantsJSON = true or undefined
        req.wantsJSON = false;
        req.wantsJSON = req.xhr;
        req.wantsJSON = req.wantsJSON || req.isSocket;
        req.wantsJSON = req.wantsJSON || !req.explicitlyAcceptsHTML;
        req.wantsJSON = req.wantsJSON || (req.is('json') && req.get('Accept'));
        req.wantsJSON = req.wantsJSON || (req.options && req.options.wantsJSON);
        return next();
    });


    // Compression middleware (should be placed before express.static)
    app.use(compression({
        threshold: 512
    }));

    // Static files middleware
    app.use( express.static(config.root + '/public') );

    /*
     * Init logs
     */
    // Logs morgan access log inside winston for production
    var log;
    if (config.env === 'production') {
        log = {
            stream: {
                write: function (message, encoding) {
                    app.logger.debug(message);
                }
            }
        };
    }
    // Logs normal access log with morgan in dev
    else {
        log = 'dev';
    }
    // Don't log during tests
    // HTTP Logging middleware
    if (config.env !== 'test'){
        app.use( morgan(log) );
    }

    /*
     * Swig engine settings
     */
    if (config.env === 'development' || config.env === 'test') {
        swig.setDefaults({
            cache: false
        });
    }


    // Express views settings
    // set views path, template engine and default layout
    // res.render will look at the view folder so we also set view folder
    app.engine('html', swig.renderFile); // associate engine to .html files
    app.set('view engine', 'html');
    app.set('views', config.views.path);
    app.use(express.static( config.views.assets.path) ); // serve static files as /css/foo.css



    // Body parser declaration.
    // We use the express body parser (taken out of express as module) and some other
    // bodyParser should be above methodOverride
    // Node.js body parsing middleware.
    app.use(bodyParser.json()); // add to req.body raw (json)
    app.use(bodyParser.urlencoded({ extended: true })); // add to req.body x-www-form-urlencoded
    app.use(multer()); // add to req.body form-data
    // Add to req.rawBody raw (text)
    // Handle raw content for Content-type text/plain and when content type is not present
    app.use(function (req, res, next) {
        req.rawBody = '';
        // We take only content text/plain because other type ar handled by body-parser for raw
        var contentType = req.headers['content-type'] || ''
            , mime = contentType.split(';')[0];

        if (mime != 'text/plain') {
            return next();
        }
        getRawBody(req, 'utf8', function (err, string) {
            if (err) return next(err);
            req.rawBody = string;
            next()
        });
    });



    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));


    // CookieParser should be above session
    app.use(cookieParser());
//    app.use(cookieSession({ secret: 'secret' }));
    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: config.session.secret,
//        store: new mongoStore({
//            url: config.db,
//            collection : 'sessions'
//        })
    }));

    // Passport initialization
    // Passport module is used to handle authentication
    // Here is its creation and injection in express middleware
    require('./passport')(app, passport, config);
    app.logger.debug('Passport module has been loaded');
    app.use(passport.initialize());
    app.use(passport.session()); // use passport session

    // connect flash for flash messages - should be declared after sessions
    app.use(flash());

    // should be declared after session and flash
//    app.use(helpers(pkg.name));



};