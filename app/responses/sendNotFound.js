module.exports = function sendNotFound (data, options) {

    // As we use res.sendOk() we can get the res reference inside function
    var req = this.req;
    var res = this;

    console.log('res.notfond() :: Sending 404 ("NOT FOUND") response');

    res.status(404);

    if( data === undefined) {
        data = {};
    }
    if(!data.url) data.url = req.originalUrl;

    // If appropriate, serve data as JSON(P)
    if (req.wantsJSON) {
        return res.json( data );
    }

    // If second argument is a string, we take that to mean it refers to a view.
    // If it was omitted, use an empty object (`{}`)
    options = (typeof options === 'string') ? { view: options } : options || {};

    // If a view was provided in options, serve it.
    // Otherwise try to guess an appropriate view, or if that doesn't
    // work, just send JSON.
    if (options.view) {
        return res.render(options.view, { data: data });
    }

    // If no second argument provided, try to serve the default view,
    // but fall back to sending JSON(P) if any errors occur.
    else return res.render('404', { data: data });

};
