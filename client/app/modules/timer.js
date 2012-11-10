// Timer module
define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Timer = app.module();

  // Default Model.
  Timer.Model = Backbone.Model.extend({

    defaults: {
      completed: false,
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
    },


    toTime: function (secs) {
      var pad = function (num) {
        return (num > 9)? "" + num: "0" + num;
      };
      return pad(Math.floor(secs / 60)) + ":" + pad(secs % 60);
    },


    tick: function () {

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
            completed: true
          });
        }
        that.tick();
      }, 1000);

      this.set({ timer: timer });

    },


    start: function () {
      this.tick();
    },


    pause: function () {
      clearTimeout(this.get("timer"));
      this.trigger('timer-paused', this);
    },


    resume: function () {
      this.tick();
      this.trigger('timer-resumed', this);
    },


    stop: function () {
      clearTimeout(this.get("timer"));
      this.set({ timer: -1 });
      this.trigger('timer-stopped', this);
    }

  });

  // Default Collection.
  Timer.Collection = Backbone.Collection.extend({

    model: Timer.Model,

    initialize: function () {
      this.count = 0;
      var that = this;
      this.on('add', function (timer) {
        var count = that.count;
        var key = ['m25', 'm5'][count % 2];
        timer.set({ duration: app.seconds[key] });
        that.count = count + 1;
      });
    },

    localStorage: new Store('pomodoro')

  });

  
  Timer.Views.Clock = Backbone.View.extend({
    template: 'timer/time',
    tagName: 'time',
    className: 'lcd',
    initialize: function () {
      this.model.on("change", this.render, this);
    },
    serialize: function () {
      return {
        time: this.model.get('time')
      };
    }
  });

  Timer.Views.Controls = Backbone.View.extend({
    template:  'timer/controls',
    tagName:   'nav',
    className: 'controls'
  });

  // Return the module for AMD compliance.
  return Timer;

});
