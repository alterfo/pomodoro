// Task module
define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Task = app.module();

  // Default Model.
  Task.Model = Backbone.Model.extend({
    defaults: function () {
      return {
        completed: false,
        pomodoros: new Pomodoro.Collection();
      }
    },

    delete: function () {
      this.destroy();
    }
  });

  // Default Collection.
  Task.Collection = Backbone.Collection.extend({
    model: Task.Model
  });

  // Default View.
  Task.Views.Layout = Backbone.Layout.extend({
    template: "task"
  });

  // Return the module for AMD compliance.
  return Task;

});
