
module.exports = {

    /**
     * This is a example route
     *
     */
    test: function(req, res) {

        // get app
        var app = req.app;

        // Get content of request body
        app.logger.debug("Content of request body:", req.body);
        app.logger.debug('Content of request body raw:', req.rawBody);

        // send json anyway
        req.wantsJSON = true;

        // add one user
        app.models.user.create({login:'demo', password:'demo'}).then(function(user){

            // retrieve users
            var users = app.models.user.find().then(function(users){
                return users;
            });
            return [users];

        }).spread(function(users){

            return res.sendOk({
                foo: 'bar',
                users: users,

                // Call a plugin method
                bar: app.plugins.foo.bar(1, 2),

                app: Object.keys(app),
                response: Object.keys(res)
            })

        }).catch(function(err){
            return next(err);
        });

    }
}