var Promise = require("bluebird");
var LOGGER = require('winston');

module.exports = {

    index: function (req, res) {
        res.sendOk({foo: 'bar'}, 'index');
    },

    /**
     * This is a example route
     *
     */
    example: function(req, res) {

        // get app
        var app = req.app;

        // Log soomething
        app.logger.debug("This is a debug log");
        app.logger.error("This is a debug log");

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

                app: Object.keys(app)
            })

        }).catch(function(err){
            return next(err);
        });

    }
}