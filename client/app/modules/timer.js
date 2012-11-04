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
      this.on('timer-update', function (count) {
        console.log(count);
      });
    },


    validate: function (attrs) {
      if (attrs.duration <= 0) {
        return "duration has to be a number greater than 0";
      }
    },


    tick: function () {

      var count,
        timer = this.get('timer');

      // first time
      if (timer < 0) {
        this.trigger('timer-started');
        count = this.get('duration');
        this.set({ count: count });
      } else {
        count = this.get('count');
      }

      var that = this;
      timer = setTimeout(function () {
        that.set({ count: --count });
        that.trigger('timer-update', count);
        if (count == 0) {
          that.set({ timer: -1 });
          return that.trigger('timer-complete');
        }
        that.tick();
      }, 1000);

      this.set({ timer: timer });

    },


    stop: function () {
      clearTimeout(this.get("timer"));
      this.set({ timer: -1 });
      this.trigger('timer-stopped');
    }

  });

  // Default Collection.
  Timer.Collection = Backbone.Collection.extend({
    model: Timer.Model
  });

  // Default View.
  Timer.Views.Layout = Backbone.Layout.extend({
    template: "timer"
  });

  // Return the module for AMD compliance.
  return Timer;

});
