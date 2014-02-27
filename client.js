(function(window) {

	var FeedMe = {

		foo: 'foo',

		init: function(options, callbackStyler) {
			this.foo = options.foo;

			callbackStyler(options);

			// this.callbackStyler = callbackStyler
			// connect to feedapi
			// if succesfull then registerWebSocketHandle(this.refreshFeed)
		},

		registerWebSocketHandle: function(callback) {
			// create webscoket connection
			// on.('data', callback(data));
		},

		registerAJAXHandle: function(callback) {
			// create webSocket connection
			// on.('data', callback(data));
		},

		refreshFeed: function(data) {
			this.callbackStyler(data);
		}

	}; // FeedMe

	//===========================================================================

	if ("function" === typeof define) {
		define(function(require) {
			return FeedMe;
		});
	} else {
		window.FeedMe = FeedMe;
	}

}(this));
