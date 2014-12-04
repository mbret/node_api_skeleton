
/**
 * Expose routes
 */

module.exports = function (app, passport, config, controllers) {


    // Index
    app.get('/', controllers.index.index);
    app.get('/example', controllers.index.example);

    // Auth
    app.post('/signin', controllers.auth.signin);

    /**
     * Error handling
     */

    // assume 404 since no middleware responded
    app.use(function (req, res, next) {
        return res.sendNotFound(res, '404', {
            url: req.originalUrl,
            error: 'Not found'
        });
    });

    app.use(function (err, req, res, next) {
        console.log('salut');
//        console.error(err.stack);
        // error page
        res.sendServerError({ error: err.stack });
    });

}