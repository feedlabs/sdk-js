(function(window) {

	var MyPlugin = {

		handlers: {},
		outputContainer: null,
		options: {
			outputContainerId: 'defaultContainerId'
		},

		/**
		 * @param {Object} options
		 * @param {Function|Null} stylerFunction
		 */
		init: function(options, stylerFunction) {
			options = this._extend(this.options, options);
			this.stylerFunction = stylerFunction || this.stylerFunction;

			this.outputContainer = document.getElementById(options.outputContainerId);

			// sample data
			var data = {type: 1, name: 'foo', params: 'bar'};

			this.printOutput(data);

			this._executeHandlers('init');
		},

		shout: function() {
			console.log('hello from shout');

			this._executeHandlers('shout');
		},

		printOutput: function(data) {
			if (this.outputContainer) {
				this.outputContainer.innerHTML = this.stylerFunction(data);
			} else {
				console.log('No `outputContainer` is defined. Add a container with `id=defaultContainerId` or pass a `outputContainerId` at init.');
			}

			this._executeHandlers('printOutput');
		},

		stylerFunction: function(data) {
			// default styler function
			return JSON.stringify(data);
		},

		// on function which collects handlers
		on: function(eventName, handler) {
			// if no handler collection exists, create one
			if (!this.handlers[eventName]) {
				this.handlers[eventName] = [];
			}
			this.handlers[eventName].push(handler);
		},

		// internal function that executes handlers with a given name
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
