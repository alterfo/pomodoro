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
        pomodoros: new Pomodoro.Collection(),
        content:   ''
      }
    },

    validate: function (attrs) {
      if ($.trim(attrs.content + "").length == 0) {
        return "content can't be empty";
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
      this.options.tasks.on('add', this.render, this);
    },
    serialize: function () {
      return {
        todos: this.options.tasks.models
      };
    },
    beforeRender: function () {
      var that = this;
      this.options.tasks.each(function (model, i) {
        that.insertView(new Task.Views.Item({ model: model, top: i == 0 }));
      });
    }
  });

  Task.Views.Item = Backbone.Layout.extend({
    template: "task",
    tagName: 'li',
    serialize: function () {
      return {
        content: this.model.get('content')
      };
    },
    beforeRender: function () {
      if (this.options.top) {
        this.el.className += ' top-task';
      }
      this.setViews({
        '.poms': new Pomodoro.Views.List({ collection: this.model.get('pomodoros') })
      });
    }
  });

  Task.Views.Form = Backbone.Layout.extend({
    template: "task-form",
    tagName: "form",
    className: "add-task",
    initialize: function () {
      this.options.tasks.on('add change', this.render, this);
    },
    events: {
      "submit": "addTask"
    },
    addTask: function () {
      var title = $('[name="title"]', this.$el).val();
      this.options.tasks.add({ content: title });
    }
  });

  // Return the module for AMD compliance.
  return Task;

});
