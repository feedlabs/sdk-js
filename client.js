(function(window) {

  var MyPlugin = {

    handlers: {},
    outputContainer: null,
    // default options
    options: {
      custId: '007',
      token: 'demo123#',
      outputContainerId: 'defaultContainerId'
    },
    timer: null,
    timer_count: 0,
    data: [
      {type: 1, name: 'foo', params: 'bar'},
      {type: 2, name: 'foo', params: 'bar'}
    ],

    /**
     * @param {Object} options
     * @param {Function|Null} stylerFunction
     */
    init: function(options, stylerFunction) {
      options = this._extend(this.options, options);
      this._stylerFunction = stylerFunction || this._stylerFunction;

      this.outputContainer = document.getElementById(options.outputContainerId);

      this._connectToServer(options);

      this._executeHandlers('init');
    },

    _connectToServer: function(options) {
      // connect to server
      // params (custId, token)
      // if ok registerUser

      this._registerUser();

    },

    _registerUser: function() {
      // ??? some webSocket stuff
      // will use setInterval()

      var _this = this;


      _this.printOutput(_this.data);
      this.timer = setInterval(function() {
        _this.timer_count += 1;
        _this.printOutput(_this.data);
      }, 10000);

    },

    /**
     * @param {Object} data
     */
    printOutput: function(data) {
      if (this.outputContainer) {
        this.outputContainer.innerHTML = this._stylerFunction(data);
      } else {
        console.log('No `outputContainer` is defined. Add a container with `id=defaultContainerId` or pass a `outputContainerId` at init.');
      }

      this._executeHandlers('printOutput');
    },

    /**
     * @param {String} eventName
     * @param {Function} handler
     * function which collects handlers
     */
    on: function(eventName, handler) {
      // if no handler collection exists, create one
      if (!this.handlers[eventName]) {
        this.handlers[eventName] = [];
      }
      this.handlers[eventName].push(handler);
    },

    /**
     * @param {Object} data
     * @returns {String}
     * @private
     * default styler function
     */
    _stylerFunction: function(data) {
      var html = '';
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          html += JSON.stringify(data[key]) + '<br>';
        }
      }
      return html;
    },

    /**
     * @param {String} eventName
     * @private
     * internal function that executes handlers with a given name
     */
    _executeHandlers: function(eventName) {
      // get all handlers with the selected name
      var handler = this.handlers[eventName] || [], len = handler.length, i;
      // execute each
      for (i = 0; i < len; i++) {
        // use apply to specify what "this" and parameters the callback gets
        handler[i].apply(this, []);
      }
    },

    // Helpers
    // =======

    /**
     * @param {Object} a
     * @param {Object} b
     * @returns {Object}
     * @private
     * merge objects into new object
     */
    _extend: function(a, b) {
      var c = {}, prop;
      for (prop in a) {
        if (a.hasOwnProperty(prop)) {
          c[prop] = a[prop];
        }
      }
      for (prop in b) {
        if (b.hasOwnProperty(prop)) {
          c[prop] = b[prop];
        }
      }
      return c;
    }

  }; // MyPlugin

  // ===========================================================================

  if ("function" === typeof define) {
    define(function(require) {
      return MyPlugin;
    });
  } else {
    window.MyPlugin = MyPlugin;
  }

}(window));
