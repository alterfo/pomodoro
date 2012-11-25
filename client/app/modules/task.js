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
    model: Task.Model,
    comparator: function(todo) {
      return todo.get('ordinal');
    }
  });

  // Default View.
  Task.Views.List = Backbone.Layout.extend({
    tagName: 'ol',
    className: 'task-list',
    events: {
      'update-sort': 'updateSort'
    },
    initialize: function () {
      this.options.tasks.on('add remove', this.render, this);
      this.$el.sortable({
        stop: function (e, ui) {
          ui.item.trigger('drop', ui.item.index());
        }
      });
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
    },
    updateSort: function (e, model, index) {
      this.options.tasks.remove(model);
      this.options.tasks.each(function (model, i) {
        model.set('ordinal', (i >= index) ? i + 1: i);
      });
      model.set('ordinal', index);
      this.options.tasks.add(model, {at: index});
      this.render();
    }
  });

  Task.Views.Item = Backbone.Layout.extend({
    template: 'task',
    tagName: 'li',
    initialize: function () {
      this.model.on('change:editing', this.render, this);
    },
    events: {
      'dblclick h2': 'edit',
      'click .edit-update': 'update',
      'click .edit-del': 'delete',
      'drop': 'drop',
      'keypress .edit-input': 'updateOnEnter'
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
      this.$el[(this.model.get('editing') ? 'add' : 'remove') + 'Class']('editing');
      this.setViews({
        '.poms': new Pomodoro.Views.List({ collection: this.model.get('pomodoros') })
      });
    },
    edit: function () {
      this.model.collection.each(function (model) {
        model.set({ editing: false });
      });
      this.model.set({ editing: true });
    },
    update: function () {
      this.model.set({
        content: this.$el.find('input').val(),
        editing: false
      });
    },
    delete: function () {
      if (confirm('Are you sure?')) {
        this.model.collection.remove(this.model);
      }
    },
    drop: function (e, index) {
      this.$el.trigger('update-sort', [this.model, index]);
    },
    updateOnEnter: function (e) {
      if (e.which === 13 && this.$el.find('input').val().trim()) {
        this.update();
      }
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
