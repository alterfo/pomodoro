define([
  // Application.
  "app",

  "modules/timer"
],

function(app, Timer) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index"
    },

    index: function() {
      // Create a layout and associate it with the #main div.

    },

    initialize: function () {
      var collections = {
        timers: new Timer.Collection()
      };
      _.extend(this, collections);

      var firstTimer = { model: collections.timers.last() };
      app.useLayout().setViews({
        ".header": [
          new Timer.Views.Clock(firstTimer),
          new Timer.Views.Controls(firstTimer)
        ]
      }).render();
    }

  });

  return Router;

});
