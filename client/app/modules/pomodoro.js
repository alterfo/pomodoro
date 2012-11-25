// Pomodoro module
define([
  // Application.
  'app'
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Pomodoro = app.module();

  // Default Model.
  Pomodoro.Model = Backbone.Model.extend({

    defaults: {
      pom: true
    }

  });

  // Default Collection.
  Pomodoro.Collection = Backbone.Collection.extend({

    model: Pomodoro.Model

  });

  // Default View.
  Pomodoro.Views.List = Backbone.Layout.extend({

    template: 'pomodoro',

    tagName: 'ul',

    className: 'tomato-count',

    initialize: function () {
      this.collection.on('add', this.render, this);
    },

    serialize: function () {
      return {
        count: this.collection.length
      };
    }

  });

  // Return the module for AMD compliance.
  return Pomodoro;

});
