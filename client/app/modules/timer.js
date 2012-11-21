// Timer module
define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Timer = app.module();

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
    },


    toTime: function (secs) {
      var pad = function (num) {
        return (num > 9)? "" + num: "0" + num;
      };
      return pad(Math.floor(secs / 60)) + ":" + pad(secs % 60);
    },


    tick: function () {

      this.set({ progress: true });

      var timer = this.get('timer');
      var count = this.get('count');;

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
      clearTimeout(this.get("timer"));
      this.trigger('timer-paused', this);
    },


    resume: function () {
      this.tick();
      this.trigger('timer-resumed', this);
    },


    stop: function () {
      this.set({ progress: false });
      clearTimeout(this.get("timer"));
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
    tagName: 'time',
    className: 'lcd',
    initialize: function () {
      this.model.on("change:time", this.render, this);
    },
    serialize: function () {
      // set html5 time[datetime] as a duration (P)
      this.$el.attr('datetime', 'P' + this.model.get('count') + 'S');
      return {
        time: this.model.get('time')
      };
    }
  });


  Timer.Views.PomodoroControls = Backbone.View.extend({
    template:  'timer/controls/pomodoro',
    tagName:   'nav',
    className: 'controls',
    events: {
      'click .btn-go': 'go',
      'click .btn-postpone': 'postpone',
      'click .btn-complete': 'complete'
    },
    serialize: function () {
      return this.model.attributes
    },
    go: function () {
      this.model.start();
    },
    postpone: function () {
      this.stop();
    },
    complete: function () {
      this.stop();
    },
    stop: function () {
      this.model.stop();
      this.model.collection.add({});
    }

  });


   Timer.Views.BreakControls = Backbone.View.extend({
    template:  'timer/controls/break',
    tagName:   'nav',
    className: 'controls',
    events: {
      'click .btn-start': 'start',
      'click .btn-pause': 'pause',
      'click .btn-resume': 'resume',
      'click .btn-next': 'next'
    },
    serialize: function () {
      return this.model.attributes
    },
    start: function () {
      this.model.start();
    },
    pause: function () {
      this.model.pause();
    },
    resume: function () {
      this.model.resume();
    },
    next: function () {
      this.model.stop();
      this.model.collection.add({});
    }
  });


  Timer.Layout = Backbone.Layout.extend({
    initialize: function () {
      // progress boolean on the model indicates timer is counting down
      this.collection.on("change:progress", this.render, this);
      this.collection.on("add", this.render, this);
    },
    template:  'timer/layout',
    beforeRender: function () {
      var last = this.collection.last();
      var type = last.get('type');
      this.insertView(new Timer.Views.Clock({ model: last }));
      this.insertView(new Timer.Views[type == "pomodoro" ? 'PomodoroControls' : 'BreakControls']({ model: last }));
    }
  });


  // Return the module for AMD compliance.
  return Timer;

});
