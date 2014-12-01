module.exports = {

    // This function is call before all routes
    // It act as a 'middleware'
    dispatch: function(req, res, next){

        // Do something with requesr / response, ...

        // Always call next to continue express run
        return next();
    },

    // This function can be called later by app.plugins.foo.bar();
    // You can add as many function you want
    bar: function( foo, bar ){
        return foo + bar;
    }

};