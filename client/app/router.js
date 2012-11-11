define([
  // Application.
  "app",

  "modules/timer",
  "modules/task"
],

function(app, Timer, Task) {

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
        tasks: new Task.Collection()
      };
      _.extend(this, collections);
      window.collections = collections;

      var lastTimer = { model: collections.timers.last() };
      app.useLayout().setViews({
        ".header": [
          new Timer.Views.Clock(lastTimer),
          new Timer.Views.Controls(lastTimer)
        ],
        ".main": [
          new Task.Views.List({ collection: collections.tasks }),
          new Task.Views.Form({ collection: collections.tasks })
        ]
      }).render();
    }

  });

  return Router;

});
