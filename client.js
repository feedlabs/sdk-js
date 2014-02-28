(function(window) {

	var MyPlugin = {

		options: {
			foo: 'foo'
		},

		/**
		 * @param {Object} options
		 * @param {Function} callback
		 */
		init: function(options, callback) {
			options = this._extend(this.options, options);

			console.log(options);

			callback(options);

			// this.callbackStyler = callbackStyler
			// connect to api
			// if succesfull then registerWebSocketHandle(this.refresh)
		},

		//so we expose a shout function
		shout: function() {

			console.log('shout');

			//now we execute callbacks registered to shout
			this._executeHandlers('shout');
		},

		//		registerWebSocketHandle: function(callback) {
		//			create webscoket connection
		//			on.('data', callback(data));
		//		},

		//		registerAJAXHandle: function(callback) {
		//			create webSocket connection
		//			on.('data', callback(data));
		//		},

		//		refresh: function(data) {
		//			this.callbackStyler(data);
		//		},

		/////////////////////////////////////////////////
		/////////////////////////////////////////////////
		/////////////////////////////////////////////////

		//handler cache
		handlers: {},

		//our on function which collects handlers
		on: function(eventName, handler) {
			//if no handler collection exists, create one
			if (!this.handlers[eventName]) {
				this.handlers[eventName] = [];
			}
			this.handlers[eventName].push(handler);
		},

		//our internal function that executes handlers with a given name
		_executeHandlers: function(eventName) {
			//get all handlers with the selected name
			var handler = this.handlers[eventName] || []
				, len = handler.length
				, i;
			//execute each
			for (i = 0; i < len; i++) {
				//you can use apply to specify what "this" and parameters the callback gets
				handler[i].apply(this, []);
			}
		},

		/////////////////////////////////////////////////
		/////////////////////////////////////////////////
		/////////////////////////////////////////////////


		// Helper
		////////////////////////////////////////////////

		// merge objects into new object

		/**
		 * @param {Object} a
		 * @param {Object} b
		 * @returns {Object}
		 * @private
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

	//===========================================================================

	if ("function" === typeof define) {
		define(function(require) {
			return MyPlugin;
		});
	} else {
		window.MyPlugin = MyPlugin;
	}

}(window));
