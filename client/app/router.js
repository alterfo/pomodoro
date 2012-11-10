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
      // add the first timer
      collections.timers.add({});
      _.extend(this, collections);
      app.useLayout().setViews({
        ".header": [
          new Timer.Views.Clock({ model: collections.timers.last() }),
          new Timer.Views.Controls()
        ]
      }).render();
    }

  });

  return Router;

});
