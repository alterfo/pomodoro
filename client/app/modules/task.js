// Task module
define([
  // Application.
  "app",

  "modules/pomodoro"
],

// Map dependencies from above array.
function(app, Pomodoro) {

  // Create a new module.
  var Task = app.module();

  // Default Model.
  Task.Model = Backbone.Model.extend({
    defaults: function () {
      return {
        completed: false,
        pomodoros: new Pomodoro.Collection()
      }
    },

    delete: function () {
      this.destroy();
    },

    toggle: function () {
        this.set({ completed: !this.get('completed') });
    }
  });

  // Default Collection.
  Task.Collection = Backbone.Collection.extend({
    model: Task.Model
  });

  // Default View.
  Task.Views.List = Backbone.Layout.extend({
    template: "task",
    tagName: "ol",
    className: "task-list",
    initialize: function () {
      this.collection.on('change', this.render, this);
    },
    serialize: function () {
      return {
        todos: this.collection
      };
    }
  });

  Task.Views.Form = Backbone.Layout.extend({
    template: "task-form",
    tagName: "form",
    className: "add-task",
    initialize: function () {
      this.collection.on('change', this.render, this);
    },
    events: {
      "submit" :"addTask"
    },
    addTask: function () {
      this.collection.add({ content: $('[name="title"]', this.$el).val() });
    }
  });

  // Return the module for AMD compliance.
  return Task;

});
