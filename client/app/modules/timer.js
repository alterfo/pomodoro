// Timer module
define([
  // Application.
  'app'
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Timer = app.module();

  var alarm = document.getElementById('alarm');

  var types = {
    'pomodoro': 25,
    'break': 5,
    'long': 30
  };

  // Default Model.
  Timer.Model = Backbone.Model.extend({

    defaults: {
      completed: false,
      progress: false,
      started: false,
      timer: -1,
      count: 0
    },


    initialize: function () {
      this.bind();
    },


    bind: function () {
      this.on('error', function () {
        console.log(arguments);
      });
      this.on('change:duration', function (timer, value) {
        timer.set({
          time:  timer.toTime(value),
          count: value
        });
      });
      this.on('change:type', function (timer, value) {
        timer.set({ duration: parseInt(types[value], 10) * 60 });
      });
      this.on('change:completed', function (timer, value) {
        if (value) {
          alarm.play();
        }
        if (timer.get('type') == 'pomodoro') {
          // needs a refactor so that this global (collections) isn't used!
          collections.tasks.first().get('pomodoros').add({});
        }
      });
    },


    toTime: function (secs) {
      var pad = function (num) {
        return (num > 9) ? '' + num : '0' + num;
      };
      return pad(Math.floor(secs / 60)) + ':' + pad(secs % 60);
    },


    tick: function () {

      this.set({ progress: true });

      var timer = this.get('timer');
      var count = this.get('count');

      var that = this;
      timer = setTimeout(function () {
        that.set({ 
          count: --count,
          time:  that.toTime(count)
        });
        if (count === 0) {
          return that.set({
            timer:     -1,
            completed: true,
            progress:  false
          });
        }
        that.tick();
      }, 1000);

      this.set({ timer: timer });

    },


    start: function () {
      this.set({ started: true });
      this.tick();
    },


    pause: function () {
      this.set({ progress: false });
      clearTimeout(this.get('timer'));
      this.trigger('timer-paused', this);
    },


    resume: function () {
      this.tick();
      this.trigger('timer-resumed', this);
    },


    stop: function () {
      this.set({ progress: false });
      clearTimeout(this.get('timer'));
      this.set({ timer: -1 });
      this.trigger('timer-stopped', this);
    }

  });

  // Default Collection.
  Timer.Collection = Backbone.Collection.extend({

    model: Timer.Model,

    initialize: function () {
      this.count = 1;
      var that = this;
      // Pattern goes pomodoro, break, pomodoro, break, pomodoro, break, pomodoro, long-break
      this.on('add', function (timer) {
        var count = that.count;
        if (count % 8 == 0) {
          timer.set({ type: 'long' });
        } else if (count % 2 == 0) {
          timer.set({ type: 'break' });
        } else {
          timer.set({ type: 'pomodoro' });
        }
        that.count = count + 1;
      });
      this.add({});
    },

    localStorage: new Store('pomodoro')

  });


  Timer.Views.Clock = Backbone.View.extend({
    template: 'timer/time',
    className: 'cols-left',
    initialize: function () {
      this.model.on('change:time', this.render, this);
    },
    serialize: function () {
      var cssClass = this.model.get('started') ? this.model.get('type') == 'pomodoro' ? ' counting': ' waiting': '';
      return {
        time: this.model.get('time'),
        count: this.model.get('count'),
        cssClass: cssClass
      };
    }
  });


  Timer.Views.PomodoroControls = Backbone.View.extend({
    template:  'timer/controls/pomodoro',
    tagName:   'nav',
    className: 'controls cols-right',
    events: {
      'click .btn-go': 'go',
      'click .btn-postpone': 'postpone',
      'click .btn-complete': 'complete'
    },
    serialize: function () {
      return this.options.timers.last().attributes
    },
    go: function () {
      if (this.options.tasks.length == 0) {
        return $('[name="title"]').focus();
      }
      this.options.timers.last().start();
    },
    postpone: function () {
      this.stop();
    },
    complete: function () {
      this.stop();
      this.options.tasks.first().get('pomodoros').add({});
    },
    stop: function () {
      this.options.timers.last().stop();
      this.options.timers.last().collection.add({});
    }
  });


   Timer.Views.BreakControls = Backbone.View.extend({
    template:  'timer/controls/break',
    tagName:   'nav',
    className: 'controls cols-right',
    events: {
      'click .btn-start': 'start',
      'click .btn-pause': 'pause',
      'click .btn-resume': 'resume',
      'click .btn-next': 'next'
    },
    serialize: function () {
      return this.options.timers.last().attributes
    },
    start: function () {
      this.options.timers.last().start();
    },
    pause: function () {
      this.options.timers.last().pause();
    },
    resume: function () {
      this.options.timers.last().resume();
    },
    next: function () {
      this.options.timers.last().stop();
      this.options.timers.last().collection.add({});
    }
  });


  Timer.Layout = Backbone.Layout.extend({
    initialize: function () {
      this.options.timers.on('change:progress add', this.render, this);
    },
    className: 'cols',
    beforeRender: function () {
      var last = this.options.timers.last();
      var type = last.get('type');
      this.insertView(new Timer.Views.Clock({ model: last }));
      this.insertView(new Timer.Views[(type == 'pomodoro' ? 'Pomodoro' : 'Break') + 'Controls'](this.options));
    }
  });


  // Return the module for AMD compliance.
  return Timer;

});
