define([
  // Application.
  "app",

  "modules/timer",
  "modules/pomodoro"
],

function(app, Timer, Pomodoro) {

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
        timers: new Timer.Collection(),
        pomodoros: new Pomodoro.Collection()
      };
      _.extend(this, collections);
      collections.pomodoros.add([{x:1}, {x:2}, {x:3}]);

      var firstTimer = { model: collections.timers.last() };
      app.useLayout().setViews({
        ".header": [
          new Timer.Views.Clock(firstTimer),
          new Timer.Views.Controls(firstTimer)
        ],
        ".main": new Pomodoro.Views.List({ collection: collections.pomodoros})
      }).render();
    }

  });

  return Router;

});
