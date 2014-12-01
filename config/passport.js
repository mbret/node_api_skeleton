
/*!
 * Module dependencies.
 */

/**
 * Expose
 */

module.exports = function (app, passport, config) {

    // serialize sessions
    passport.serializeUser(function(user, done) {
        return done(null, user.id)
    });

    passport.deserializeUser(function(id, done) {
        app.models.user.findOne({ id: id }, function (err, user) {
            return done(err, user);
        })
    });

    // use these strategies
    passport.use( require('./passport/local')(app, config) );
};