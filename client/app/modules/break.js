// Break module
define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Break = app.module();

  // Default Model.
  Break.Model = Backbone.Model.extend({
  
  });

  // Default Collection.
  Break.Collection = Backbone.Collection.extend({
    model: Break.Model
  });

  // Default View.
  Break.Views.Layout = Backbone.Layout.extend({
    template: "break"
  });

  // Return the module for AMD compliance.
  return Break;

});
