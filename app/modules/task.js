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
        editing: false,
        pomodoros: new Pomodoro.Collection(),
        content:   ''
      };
    },

    initialize: function () {
      this.on('remove', this.destroy, this);
    },

    validate: function (attrs) {
      if ($.trim(attrs.content + '').length === 0) {
        return "content can't be empty";
      }
    },

    del: function () {
      this.destroy();
    },

    toggle: function () {
      this.save({ completed: !this.get('completed') });
    },

    parse: function (o) {
      o.pomodoros = new Pomodoro.Collection(o.pomodoros);
      return o;
    }

  });

  // Default Collection.
  Task.Collection = Backbone.Collection.extend({

    model: Task.Model,

    localStorage: new Store('pomodoro'),

    nextOrdinal: function () {
      if (!this.length) {
        return 1;
      }
      return this.last().get('ordinal') + 1;
    },

    comparator: function (todo) {
      return todo.get('ordinal');
    },

    show: function (what) {
      this.trigger('show', what);
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
      var tasks = this.options.tasks;
      tasks.on('add remove', this.render, this);
      this.$el.sortable({
        stop: function (e, ui) {
          ui.item.trigger('drop', ui.item.index());
        }
      });
      tasks.on('show', this.show, this);
      tasks.on('change:completed', function () {
        var task = tasks.find(function (task) {
          return !task.get('completed');
        });
        if (task) {
          task.trigger('render');
        }
      }, this);
    },

    serialize: function () {
      return {
        todos: this.options.tasks.models
      };
    },

    beforeRender: function () {
      var topIncomplete = this.options.tasks.find(function (task) {
        return task.get('completed') === false;
      });
      this.options.tasks.each(function (model, i) {
        this.insertView(new Task.Views.Item({ model: model, top: model.cid === topIncomplete.cid }));
      }, this);
    },

    updateSort: function (e, model, index) {
      this.options.tasks.remove(model);
      this.options.tasks.each(function (model, i) {
        model.save('ordinal', (i >= index) ? i + 1: i);
      });
      model.set('ordinal', index);
      this.options.tasks.create(model, { at: index });
      this.render();
    },

    show: function (what) {
      this.$el.toggleClass('complete', what === 'complete');
      this.$el.toggleClass('incomplete', what === 'incomplete');
    }

  });

  Task.Views.Item = Backbone.Layout.extend({

    template: 'task',

    tagName: 'li',

    initialize: function () {
      this.model.on('change:editing change:completed', this.render, this);
      this.model.on('render', function () {
        this.render();
        this.options.top = true;
        // hacky
        $('.top-task').removeClass('top-task');
        this.$el.addClass('top-task');
      }, this);
    },

    events: {
      'dblclick h2': 'edit',
      'click .edit-update': 'update',
      'click .edit-del': 'del',
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
      this.$el.toggleClass('editing', this.model.get('editing'));
      this.$el.toggleClass('complete', this.model.get('completed'));
      this.$el.toggleClass('incomplete', !this.model.get('completed'));
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
      this.model.save({
        content: this.$el.find('input').val(),
        editing: false
      });
    },

    del: function () {
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
      this.options.tasks.create({ 
        content: title,
        ordinal: this.options.tasks.nextOrdinal()
      });
    }

  });

  // Return the module for AMD compliance.
  return Task;

});
