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
      "": "index",
      "completed": "completed"
    },

    index: function() {
      // Create a layout and associate it with the #main div.

    },

    completed: function () {

    },

    initialize: function () {
      var collections = {
        timers: new Timer.Collection(),
        tasks: new Task.Collection()
      };
      _.extend(this, collections);
      window.collections = collections;

      app.useLayout().setViews({
        ".header": new Timer.Layout(collections),
        ".main": [
          new Task.Views.List(collections),
          new Task.Views.Form(collections)
        ]
      }).render();
    }

  });

  return Router;

});
