// Pomodoro module
define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Pomodoro = app.module();

  // Default Model.
  Pomodoro.Model = Backbone.Model.extend({
  
  });

  // Default Collection.
  Pomodoro.Collection = Backbone.Collection.extend({
    model: Pomodoro.Model
  });

  // Default View.
  Pomodoro.Views.Layout = Backbone.Layout.extend({
    template: "pomodoro"
  });

  // Return the module for AMD compliance.
  return Pomodoro;

});
