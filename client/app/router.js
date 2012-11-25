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
      this.setUp(false);
    },

    completed: function () {
      this.setUp(true);
    },

    setUp: function (completed) {
      var collections = {
        timers: new Timer.Collection(),
        tasks: new Task.Collection(),
        completed: completed
      };
      _.extend(this, collections);
      collections.tasks.fetch();
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
