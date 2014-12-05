
// Be careful if one error happen here it will be displayed
// in the response because this method is the last handle
module.exports = function sendServerError(data, options) {

    // As we use res.sendOk() we can get the res reference inside function
    var req = this.req;
    var res = this;
    var app = req.app;

    try {

        // Set status code
        res.status(500);

        // Log error to console
        if (data !== undefined) {
            app.logger.error('Sending 500 ("Server Error") response: \n', require('util').inspect(data, false, 2, true));
        }
        else app.logger.error('Sending empty 500 ("Server Error") response');

        // Only include errors in response if application environment
        // is not set to 'production'.  In production, we shouldn't
        // send back any identifying information about errors.
        if (process.env.NODE_ENV === 'production') {
            data = undefined;
        }

        // If the user-agent wants JSON, always respond with JSON
        if (req.wantsJSON) {
            return res.json(data);
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
        else return res.render('500', { data: data });
    }
    // This prevent to send any error to client if something crash in this method
    // which is the last one and should handle error
    catch (err){
        console.log('An exception happened in Error handler route');
        console.log(err);
        return res.send(500, null);
    }

};
