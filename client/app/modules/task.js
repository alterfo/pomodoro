// Task module
define([
  // Application.
  'app',

  'modules/pomodoro'
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
      if ($.trim(attrs.content + '').length == 0) {
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
    tagName: 'ol',
    className: 'task-list',
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
    template: 'task',
    tagName: 'li',
    initialize: function () {
      this.model.on('change:editing', this.render, this);
    },
    events: {
      'dblclick h2': 'edit'
    },
    serialize: function () {
      return {
        content: this.model.get('content'),
        editing: this.model.get('editing')
      };
    },
    beforeRender: function () {
      if (this.options.top) {
        this.$el.addClass('top-task');
      }
      if (this.model.get('editing')) {
        this.$el.addClass('editing');
      }
      this.setViews({
        '.poms': new Pomodoro.Views.List({ collection: this.model.get('pomodoros') })
      });
    },
    edit: function () {
      this.model.set({ editing: true });
    }
  });

  Task.Views.Form = Backbone.Layout.extend({
    template: 'task-form',
    tagName: 'form',
    className: 'add-task',
    initialize: function () {
      this.options.tasks.on('add change', this.render, this);
    },
    events: {
      'submit': 'addTask'
    },
    addTask: function () {
      var title = $('[name="title"]', this.$el).val();
      this.options.tasks.add({ content: title });
    }
  });

  // Return the module for AMD compliance.
  return Task;

});
