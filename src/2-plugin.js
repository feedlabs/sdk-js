var FeedPlugin = function(options, stylerFunction) {

  /** @type {Object} */
  this.objectList = {};

  /** @type {Array} */
  this.defaultEntryIds = [];

  /** @type {HTMLElement|Null} */
  this.outputContainer = null;

  /** @type {Object} */
  this.defaultOptions = {
    feedId: '',
    outputContainerId: 'defaultContainerId',
    defaultElementLayout: '',
    defaultElementCount: 0
  };

  /**
   * @param {Object|Null} options
   * @param {Function|Null} stylerFunction
   */
  this.options = this._extend(this.defaultOptions, options);
  this.stylerFunction = stylerFunction || this._stylerFunction;
  this.outputContainer = document.getElementById(this.options.outputContainerId);
  this._addDefaultEntries();

  var _this = this;
  setTimeout(function() {
    var url = 'http://www.feedify.dev:10111/v1/feed/' + _this.options.feedId + '/entry';
    _this.load(url, function(httpRequest) {
      _this._loadFirstEntries(JSON.parse(httpRequest.responseText));
    });
  }, 1500);

  var socketRedis = this.getSocketRedisClient('http://www.feedify.dev:8090');
  socketRedis.subscribe('iO5wshd5fFE5YXxJ/hfyKQ==:17', new Date().getTime(), {sessionId: "55e10ffb7ba3ca6d8fd39f25cd64253d"}, function(event, data) {
    _this.processData(data.data);
  });


  /**
   * @param {Object} firstEntries
   */
  this._loadFirstEntries = function(firstEntries) {
    for (var key in firstEntries) {
      if (firstEntries.hasOwnProperty(key)) {
        var data = firstEntries[key];
        _this.add(data);
      }
    }
    this._removeDefaultEntries();
  };

  /**
   * @param {Object} data
   */
  this.processData = function(data) {
    switch (data.Action) {
      case 'add':
        this.add(data);
        break;
      case 'remove':
        this.remove(data);
        break;
      case 'update':
        this.update(data);
        break;
      default:
        console.log('Unknown action `' + data.Action + '`');
    }
  };

  /**
   * @param {Object} data
   */
  this.add = function(data) {
    console.log(data);
    var objectId = data.Id;
    this.objectList[objectId] = objectId;

    var domElement = document.createElement('div');
    domElement.id = objectId;
    domElement.innerHTML = this.stylerFunction(data.Data);

    this.outputContainer.insertBefore(domElement, this.outputContainer.firstChild);
  };

  /**
   * @param {Object} data
   */
  this.remove = function(data) {
    var domElement = document.getElementById(data.Id);
    domElement.remove();
    delete this.objectList[data.Id];
  };


  /**
   * @param {Object} data
   */
  this.update = function(data) {
    var domElement = document.getElementById(data.Id);
    domElement.innerHTML = this.stylerFunction(data.Data);
  };


  // Helpers
  // =======


  this.load = function(url, callback) {
    var xhr;
    if (typeof XMLHttpRequest !== 'undefined') {
      xhr = new XMLHttpRequest();
    } else {
      var versions = ["MSXML2.XmlHttp.5.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.2.0", "Microsoft.XmlHttp"];
      for (var i = 0, len = versions.length; i < len; i++) {
        try {
          xhr = new ActiveXObject(versions[i]);
          break;
        }
        catch (e) {
        }
      }
    }
    function ensureReadiness() {
      if (xhr.readyState < 4) {
        return;
      }
      if (xhr.status !== 200) {
        return;
      }
      if (xhr.readyState === 4) {
        callback(xhr);
      }
    }

    xhr.onreadystatechange = ensureReadiness;
    xhr.open('GET', url, true);
    xhr.send('');
  };

  return this;
};

FeedPlugin.prototype._uniqueId = function() {
  return '_' + Math.random().toString(36).substr(2, 9);
};

FeedPlugin.prototype._addDefaultEntries = function() {
  for (var i = 1; i <= this.options.defaultElementCount; i++) {
    var objectId = this._uniqueId();
    var entry = document.createElement('div');
    entry.id = objectId;
    entry.innerHTML = this.options.defaultElementLayout;
    this.outputContainer.appendChild(entry);

    this.defaultEntryIds.push(objectId);
  }
};

FeedPlugin.prototype._removeDefaultEntries = function() {
  this.defaultEntryIds.forEach(function(id) {
    var domObject = document.getElementById(id);
    domObject.parentNode.removeChild(domObject);
  });
};


/**
 * @param {Object} data
 * @returns {String}
 */
FeedPlugin.prototype._stylerFunction = function(data) {
  return JSON.stringify(data);
};


/**
 * @param {Object} a
 * @param {Object} b
 * @returns {Object}
 */
FeedPlugin.prototype._extend = function(a, b) {
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
};




FeedPlugin.prototype.getSocketRedisClient = function(url) {

  /**
   * @type {SockJS}
   */
  var sockJS;

  /**
   * @type {Object}
   */
  var subscribes = {};

  /**
   * @type {Number|Null}
   */
  var closeStamp = null;

  /**
   * @param {String} url
   * @constructor
   */
  function Client(url) {
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
        handler.onopen.call(handler)
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
        if (event.keyCode == 27) {
          event.preventDefault();
        }
      })
    }
  }

  /**
   * @param {String} channel
   * @param {Number} [start]
   * @param {Object} [data]
   * @param {Function} [onmessage] fn(data)
   */
  Client.prototype.subscribe = function(channel, start, data, onmessage) {
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
  Client.prototype.unsubscribe = function(channel) {
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
  Client.prototype.send = function(data) {
    sockJS.send(JSON.stringify({event: 'message', data: {data: data}}));
  };

  /**
   * @param {String} channel
   * @param {String} event
   * @param {Object} data
   */
  Client.prototype.publish = function(channel, event, data) {
    sockJS.send(JSON.stringify({event: 'publish', data: {channel: channel, event: event, data: data}}));
  };

  Client.prototype.onopen = function() {
  };

  Client.prototype.onclose = function() {
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

  return new Client(url);

};
