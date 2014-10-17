/**
 * @returns {SocketRedisClient}
 */
FeedPlugin.prototype.getSocketRedisClient = function() {
  if (typeof window.feedify === 'undefined') {
    window.feedify = {};
  }

  if (typeof window.feedify.socketRedisClient === 'undefined') {
    window.feedify.socketRedisClient = this.createSocketRedisClient('http://www.feedify.dev:8090');
  }

  return window.feedify.socketRedisClient;
};

/**
 * @param {String} url
 * @returns {SocketRedisClient}
 */
FeedPlugin.prototype.createSocketRedisClient = function(url) {
  var sockJS;
  var subscribes = {};
  var closeStamp = null;

  function SocketRedisClient(url) {
    var handler = this;
    retryDelayed(100, 5000, function(retry, resetDelay) {
      sockJS = new SockJS(url);
      sockJS.onopen = function() {
        resetDelay();
        for (var channel in subscribes) {
          if (subscribes.hasOwnProperty(channel)) {
            subscribe(channel, closeStamp);
          }
        }
        closeStamp = null;
        handler.onopen.call(handler);
      };
      sockJS.onmessage = function(event) {
        var data = JSON.parse(event.data);
        if (subscribes[data.channel]) {
          subscribes[data.channel].callback.call(handler, data.event, data.data);
        }
      };
      sockJS.onclose = function() {
        closeStamp = new Date().getTime();
        retry();
        handler.onclose.call(handler);
      };
    });

    // https://github.com/sockjs/sockjs-client/issues/18
    if (window.addEventListener) {
      window.addEventListener('keydown', function(event) {
        if (event.keyCode === 27) {
          event.preventDefault();
        }
      });
    }
  }

  /**
   * @param {String} channel
   * @param {Number} [start]
   * @param {Object} [data]
   * @param {Function} [onmessage] fn(data)
   */
  SocketRedisClient.prototype.subscribe = function(channel, start, data, onmessage) {
    if (subscribes[channel]) {
      throw 'Channel `' + channel + '` is already subscribed';
    }
    subscribes[channel] = {event: {channel: channel, start: start, data: data}, callback: onmessage};
    if (sockJS.readyState === SockJS.OPEN) {
      subscribe(channel);
    }
  };

  /**
   * @param {String} channel
   */
  SocketRedisClient.prototype.unsubscribe = function(channel) {
    if (subscribes[channel]) {
      delete subscribes[channel];
    }
    if (sockJS.readyState === SockJS.OPEN) {
      sockJS.send(JSON.stringify({event: 'unsubscribe', data: {channel: channel}}));
    }
  };

  /**
   * @param {Object} data
   */
  SocketRedisClient.prototype.send = function(data) {
    sockJS.send(JSON.stringify({event: 'message', data: {data: data}}));
  };

  /**
   * @param {String} channel
   * @param {String} event
   * @param {Object} data
   */
  SocketRedisClient.prototype.publish = function(channel, event, data) {
    sockJS.send(JSON.stringify({event: 'publish', data: {channel: channel, event: event, data: data}}));
  };

  SocketRedisClient.prototype.onopen = function() {
  };

  SocketRedisClient.prototype.onclose = function() {
  };

  /**
   * @param {String} channel
   * @param {Number} [startStamp]
   */
  var subscribe = function(channel, startStamp) {
    var event = subscribes[channel].event;
    if (!startStamp) {
      startStamp = event.start || new Date().getTime();
    }
    sockJS.send(JSON.stringify({event: 'subscribe', data: {channel: event.channel, data: event.data, start: startStamp}}));
  };

  /**
   * @param {Number} delayMin
   * @param {Number} delayMax
   * @param {Function} execution fn({Function} retry, {Function} resetDelay)
   */
  var retryDelayed = function(delayMin, delayMax, execution) {
    var delay = delayMin;
    var timeout;
    var resetDelay = function() {
      delay = delayMin;
      window.clearTimeout(timeout);
    };
    var retry = function() {
      var self = this;
      window.clearTimeout(timeout);
      timeout = window.setTimeout(function() {
        execution.call(self, retry, resetDelay);
        delay = Math.min(Math.max(delayMin, delay * 2), delayMax);
      }, delay);
    };
    execution.call(this, retry, resetDelay);
  };

  return new SocketRedisClient(url);

};
