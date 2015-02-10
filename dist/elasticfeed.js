var Channel = (function() {

  const JOIN = 0;
  const LEAVE = 1;
  const MESSAGE = 2;

  var defaultOptions = {
    id: null,
    transport: 'ws',
    connectOnInit: true,
    host: 'localhost',
    port: '10100',
    path_ws: '/stream/ws',
    path_lp: '/stream/lp',
    path_sse: '/stream/sse'
  };

  function Channel(options) {

    /** @type {String} */
    this.id = _uniqueId();

    /** @type {String} */
    this.url = null;

    /** @type {String} */
    defaultOptions.url = defaultOptions.transport + '://' + defaultOptions.host + ':' + defaultOptions.port + defaultOptions.path_ws

    /** @type {Object} */
    this.options = _extend(defaultOptions, options);

    if (this.options.id !== null) {
      this.id = this.options.id;
    }

    if (this.options.url !== null) {
      this.url = this.options.url;
    }

    /** @type {Object} */
    this._handlers = {};

    /** @type {WebSocket} */
    this._socket = null;

    this._xhr = [];
  }

  // Handlers

  /**
   * @param {Event} event
   * @param {Function} callback
   */
  Channel.prototype.on = function(name, callback) {
    switch (name) {
      case 'join':
        type = JOIN;
        break;
      case 'leave':
        type = LEAVE;
        break;
      case 'message':
        type = MESSAGE;
        break;
      default:
        return false;
    }
    if (this._handlers[type] === undefined) {
      this._handlers[type] = [];
    }
    this._handlers[type].push(callback);
    return true;
  };

  // Events

  /**
   * @param {Event} event
   */
  Channel.prototype.onData = function(event) {
    switch (event.type) {
      case JOIN:
        this.onJoin(event.user, event.ts);
        break;
      case LEAVE:
        this.onLeave(event.user, event.ts);
        break;
      case MESSAGE:
        this.onMessage(event.user, event.ts, event.content);
        break;
    }
  };

  Channel.prototype.onJoin = function(chid, timestamp) {
    for (var i in this._handlers[JOIN]) {
      this._handlers[JOIN][i].call(this, chid, timestamp);
    }
  };

  Channel.prototype.onLeave = function(chid, timestamp) {
    for (var i in this._handlers[LEAVE]) {
      this._handlers[LEAVE][i].call(this, chid, timestamp);
    }
  };

  Channel.prototype.onMessage = function(chid, timestamp, data) {
    systemEvent = new Event(data);

    for (var i in this._handlers[MESSAGE]) {
      this._handlers[MESSAGE][i].call(this, chid, timestamp, systemEvent);
    }
  };

  // Connection

  Channel.prototype.isWebSocket = function() {
    return this._socket !== undefined;
  };

  Channel.prototype.getConnection = function() {
  };

  Channel.prototype.getWebSocketConnection = function() {
    var self = this;

    if (this._socket === null) {
      this._socket = new WebSocket(this.url + '/join?chid=' + this.id);

      this._socket.onmessage = function(event) {
        event = new Event(JSON.parse(event.data));
        self.onData(event);
      };
    }

    return {
      send: function(data) {
        self._socket.send(JSON.stringify(data));
      }
    };
  };

  Channel.prototype.getLongPoolingConnection = function() {

    self = this;

    if (this._socket === null) {
      var lastReceived = 0;
      var isWait = false;

      this.getJSON(this.url + '/join?chid=' + this.id, function(data) {
        if (data === null) {
          return;
        }
        event = new Event(data.response);
        self.onData(event);
      });

      var fetch = function() {
        if (isWait) {
          return;
        }
        isWait = true;
        self.getJSON(self.url + '/fetch?lastReceived=' + lastReceived, function(data, code) {

          if (code == 4) {
            isWait = false;
          }

          if (data === null) {
            return;
          }

          self.each(data, function(i, event) {
            event = new Event(event);
            self.onData(event);

            lastReceived = event.GetTimestamp();
          });
          isWait = false;
        });
      };

      this._socket = setInterval(fetch, 3000);
      fetch();
    }

    return {
      send: function(data) {
        self.post(self.url + '/post', {chid: self.id, data: JSON.stringify(data)}, function(data) {
          response_json = JSON.parse(data);
          event = new Event(JSON.parse(response_json.response));
          self.onData(event);
        });
      }
    };
  };

  Channel.prototype.getSSEConnection = function() {

    es = new EventSource(this.url + '/join');
    es.onmessage = function(event) {
    };

    es.addEventListener("some-event", function(event) {
    }, false);

    return {
      send: function(data) {
        self.post(this.url + '/post', {chid: self.id, data: JSON.stringify(data)}, function(data) {
          response_json = JSON.parse(data);
          event = new Event(JSON.parse(response_json.response));
          self.onData(event);
        });
      }
    };
  };

  // HTTP

  Channel.prototype.__cleanup = function() {
    for (var i in this._xhr) {
      if (this._xhr[i].xhr.readyState == 4) {
        delete this._xhr[i];
      }
    }
  };

  Channel.prototype.getJSON = function(url, callback) {

    this.__cleanup();

    var pos = this._xhr.length;

    this._xhr[pos] = {
      xhr: new XMLHttpRequest(),
      cb: callback
    };

    var self = this;
    this._xhr[pos].xhr.onreadystatechange = function() {
      if (self._xhr[pos].xhr.readyState == 4 && self._xhr[pos].xhr.status == 200) {
        if (self._xhr[pos].xhr.responseText !== "") {
          data = JSON.parse(self._xhr[pos].xhr.responseText);
          self._xhr[pos].cb.call(this, data, self._xhr[pos].xhr.readyState);
        } else {
          self._xhr[pos].cb.call(this, null, self._xhr[pos].xhr.readyState);
        }
      } else {
        self._xhr[pos].cb.call(this, null, self._xhr[pos].xhr.readyState);
      }
    };
    this._xhr[pos].xhr.open("GET", url, true);
    this._xhr[pos].xhr.send('');
  };

  Channel.prototype.each = function(obj, callback) {
    for (i = 0; i < obj.length; i++) {
      value = callback.call(obj[i], i, obj[i]);

      if (value === false) {
        break;
      }
    }
  };

  Channel.prototype.queryString = function(obj) {
    return Object.keys(obj).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
    }).join('&');
  };

  Channel.prototype.post = function(url, data, callback) {

    this.__cleanup();

    var pos = this._xhr.length;

    this._xhr[pos] = {
      xhr: new XMLHttpRequest(),
      cb: callback
    };

    var self = this;
    this._xhr[pos].xhr.onreadystatechange = function() {
      if (self._xhr[pos].xhr.readyState == 4 && self._xhr[pos].xhr.status == 200) {
        self._xhr[pos].cb.call(this, self._xhr[pos].xhr.responseText);
      }
    };
    dataString = this.queryString(data);
    this._xhr[pos].xhr.open("POST", url + "?" + dataString, true);
    this._xhr[pos].xhr.send(dataString);
  };

  // Helpers

  var _extend = function(a, b) {
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

  var _uniqueId = function() {
    return '_' + Math.random().toString(36).substr(2, 36);
  };

  return Channel;

})();
;(function(window) {

  /** @type {Object} */
  var defaultOptions = {

    /** @type {Object} */
    channel: {
      url: 'localhost',
      transport: 'ws'
    }
  };

  var elasticfeed = {

    /** @type {Object} */
    options: {},

    /** @type {Object} */
    channelList: {},

    /** @type {Object} */
    feedList: {},

    init: function(options) {
      this.options = _extend(defaultOptions, options);
    },

    initFeed: function(id, options) {
      if (id === undefined) {
        return false;
      }

      if (this.feedList[id] === undefined) {
        opts = _extend(this.options, options || {});
        channel = this.getChannel(opts.channel);

        this.feedList[id] = new Feed(id, opts, channel);
      }

      return this.feedList[id];
    },

    /**
     * Returns Channel defined per API url
     * @param options
     * @param credential
     * @returns {*}
     */
    getChannel: function(options, credential) {
      if (options.url === undefined) {
        return false;
      }

      if (this.channelList[options.url] === undefined) {
        this.channelList[options.url] = new Channel(options, credential);
      }

      return this.channelList[options.url];
    },

    findFeed: function(id) {
      if (this.feedList[id] === undefined) {
        return false;
      }
      return this.feedList[id];
    },

    findChannel: function(url) {
      if (this.channelList[url] === undefined) {
        return false;
      }
      return this.channelList[url];
    }

  };

  // Helpers

  var _extend = function(a, b) {
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

  if ("function" === typeof define) {
    define(function(require) {
      return elasticfeed;
    });
  } else {
    window.elasticfeed = elasticfeed;
  }

}(window));

// Helpers

Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
};

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  for (var i = 0, len = this.length; i < len; i++) {
    if (this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i]);
    }
  }
};
;var Entry = (function() {

  const UPDATE = 1;
  const DELETE = 2;
  const HIDE = 3;
  const SHOW = 4;

  /** @type {Entry} */
  var localCache = {};

  function Entry(data, options) {
    /** @type {String} */
    this.id = null;

    /** @type {String} */
    this.viewId = _uniqueId();

    /** @type {String} */
    this.data = data;

    /** @type {Object} */
    this._feed = null;

    /** @type {Function} */
    this._styler = (options ? options.styler : undefined) || function() {
      return data;
    };

    /** @type {Object} */
    this._handlers = {};

    if (this.data.Id !== undefined) {
      this.id = this.data.Id;
    }

  }

  Entry.prototype.setParent = function(feed) {
    this._feed = feed;
    this.bindMessages();
  };

  Entry.prototype.getViewId = function() {
    return this.viewId;
  };

  // UI

  // TODO:
  // should make animations, should be configurable by developer
  // first level is style function; second level is render function
  Entry.prototype.render = function() {
    try {
      document.getElementById(this.viewId).innerHTML = this._styler.call(this, this.data.Id + "<br>" + this.data.Data);
    } catch (e) {
      // serious error
    }
  };

  // Events

  Entry.prototype.on = function(type, callback) {
    switch (name) {
      case 'delete':
        type = DELETE;
        break;
      case 'update':
        type = UPDATE;
        break;
      case 'hide':
        type = HIDE;
        break;
      case 'show':
        type = SHOW;
        break;
      default:
        return false;
    }
    if (this._handlers[type] === undefined) {
      this._handlers[type] = [];
    }
    this._handlers[type].push(callback);
    return true;
  };

  Entry.prototype.onData = function(entryEvent) {
    switch (entryEvent.type) {
      case DELETE:
        this.onDelete(entryEvent.ts);
        break;
      case UPDATE:
        this.onUpdate(entryEvent.ts, entryEvent.content);
        break;
      case HIDE:
        this.onHide(entryEvent.ts);
        break;
      case SHOW:
        this.onShow(entryEvent.ts);
        break;
    }
  };

  // Management

  Entry.prototype.update = function(timestamp, data) {
    this.data = data;
    this.render();
  };

  Entry.prototype.delete = function() {
    this.unbindMessages();
    document.getElementById(this.viewId).remove();
  };

  Entry.prototype.hide = function() {
  };

  Entry.prototype.show = function() {
  };

  // API

  Entry.prototype.apiEntryUpdate = function(data) {
  };

  Entry.prototype.apiMetricSave = function(data) {
  };

  // Events callbacks

  Entry.prototype.onUpdate = function(timestamp, data) {
    this.update(timestamp, data);

    for (var i in this._handlers[UPDATE]) {
      this._handlers[UPDATE][i].call(this, timestamp, data);
    }
  };

  Entry.prototype.onDelete = function(timestamp) {
    for (var i in this._handlers[DELETE]) {
      this._handlers[DELETE][i].call(this, timestamp);
    }
  };

  Entry.prototype.onHide = function(timestamp) {
    for (var i in this._handlers[HIDE]) {
      this._handlers[HIDE][i].call(this, timestamp);
    }
  };

  Entry.prototype.onShow = function(timestamp) {
    for (var i in this._handlers[SHOW]) {
      this._handlers[SHOW][i].call(this, timestamp);
    }
  };

  // Handlers

  Entry.prototype.bindMessages = function() {
    var self = this;
    this.__bindFeed = this._feed.on('entry-message', function(ts, entryEvent) {
      if (self.id !== null && (entryEvent.user == self.id || entryEvent.user == '*')) {
        self.onData(entryEvent);
      }
    });
  };

  Entry.prototype.unbindMessages = function() {
    this._feed.off(this.__bindFeed);
  };

  // Getters

  Entry.prototype.getTimestamp = function() {
    return this.ts;
  };

  // Helpers

  var _uniqueId = function() {
    return '_' + Math.random().toString(36).substr(2, 36);
  };

  return Entry;

})();
;var Event = (function() {

  function Event(event) {

    /** @type {String} */
    this.id = event.Id || null;

    /** @type {Integer} */
    this.ts = event.Timestamp;

    /** @type {Integer} */
    this.actionGroup = null;

    /** @type {Integer} */
    this.actionType = null;

    /** @type {String} */
    this.user = event.User;

    /** @type {String} */
    this.type = event.Type;

    /** @type {String} */
    this.contentType = 'string';

    /** @type {String} */
    try {
      this.content = JSON.parse(event.Content);
      this.contentType = 'json';
    } catch (e) {
      this.content = event.Content;
    }
  }

  Event.prototype.GetTimestamp = function() {
    return this.ts;
  };

  Event.prototype.PrintContent = function() {
    if (this.contentType == 'string') {
      return this.content;
    }
    return JSON.stringify(this.content);
  };

  return Event;

})();
;var Feed = (function() {

  const SYSTEM_FEED_MESSAGE = 1;

  const RELOAD = 1;
  const EMPTY = 2;
  const ENTRY_NEW = 3;
  const ENTRY_INIT = 4;
  const ENTRY_MORE = 5;
  const HIDE = 6;
  const SHOW = 7;
  const ENTRY_MESSAGE = 8;

  const AUTHENTICATED = 100;
  const AUTHENTICATION_REQUIRED = 101;
  const AUTHENTICATION_FAILED = 102;
  const LOGGED_OUT = 103;

  /** @type {Feed} */
  var localCache = {};

  var globalOptions = {

    /** @type {Function} */
    stylerFunction: function(data) {
      return JSON.stringify(data);
    },

    /** @type {Function} */
    renderFunction: function(data) {
      return JSON.stringify(data);
    }
  };

  var globalCredential = {

    /** @type {String} */
    username: null,

    /** @type {String} */
    token: null,

    /** @type {String} */
    method: 'basic'
  };

  function Feed(id, options, channel) {

    /** @type {String} */
    this.id = id;

    /** @type {String} */
    this.feedId = id.split(/[::]/)[0];

    /** @type {String} */
    this.appId = id.split(/[::]/)[1];

    /** @type {String} */
    this.orgId = id.split(/[::]/)[2];

    /** @type {Channel} */
    this.channel = channel;

    /** @type {Array} */
    this.entryList = [];

    this.loadInit();

    /** @type {Object} */
    if (this.channel.options.transport == 'ws') {
      this.socket = this.channel.getWebSocketConnection();
    } else if (this.channel.options.transport == 'lp') {
      this.socket = this.channel.getLongPoolingConnection();
    }

    /** @type {Object} */
    this.options = _extend(globalOptions, options);

    /** @type {Function} */
    this.stylerFunction = this.options.stylerFunction;

    /** @type {Function} */
    this.renderFunction = this.options.renderFunction;

    /** @type {DOM} */
    this.outputContainer = document.getElementById(this.options.outputContainerId);

    this.bindChannel(this.channel);

    /** @type {Object} */
    this._handlers = {};

    /** @type {Object} */
    this._state = {
      initiated: false
    };
  }

  Feed.prototype.on = function(name, callback) {
    switch (name) {
      case 'reload':
        type = RELOAD;
        break;
      case 'empty':
        type = EMPTY;
        break;
      case 'entry':
        type = ENTRY_NEW;
        break;
      case 'entry-init':
        type = ENTRY_INIT;
        break;
      case 'entry-more':
        type = ENTRY_MORE;
        break;
      case 'hide':
        type = HIDE;
        break;
      case 'show':
        type = SHOW;
        break;
      case 'entry-message':
        type = ENTRY_MESSAGE;
        break;
      case 'authenticated':
        type = AUTHENTICATED;
        break;
      case 'authentication-required':
        type = AUTHENTICATION_REQUIRED;
        break;
      case 'authentication-failed':
        type = AUTHENTICATION_FAILED;
        break;
      case 'logout':
        type = LOGGED_OUT;
        break;
      default:
        return false;
    }
    if (this._handlers[type] === undefined) {
      this._handlers[type] = [];
    }
    this._handlers[type].push(callback);

    return callback;
  };

  Feed.prototype.off = function(callback) {
    for (var i in this._handlers) {
      for (var x in this._handlers[i]) {
        if (this._handlers[i][x] == callback) {
          delete this._handlers[i][x];
          return;
        }
      }
    }
  };

  Feed.prototype.onData = function(feedEvent) {
    switch (feedEvent.type) {
      case RELOAD:
        this.onReload(feedEvent.ts);
        break;
      case EMPTY:
        this.onEmpty(feedEvent.ts);
        break;
      case ENTRY_NEW:
        this.onEntryNew(feedEvent.ts, feedEvent.content);
        break;
      case ENTRY_INIT:
        this.onEntryInit(feedEvent.ts, feedEvent.content);
        break;
      case ENTRY_MORE:
        this.onEntryMore(feedEvent.ts, feedEvent.content);
        break;
      case HIDE:
        this.onHide(feedEvent.ts);
        break;
      case SHOW:
        this.onShow(feedEvent.ts);
        break;
      case ENTRY_MESSAGE:
        this.onEntryMessage(feedEvent.ts, feedEvent.content);
        break;
      case AUTHENTICATED:
        this.onAuthenticated(feedEvent.ts, feedEvent.content);
        break;
      case AUTHENTICATION_REQUIRED:
        this.onAuthenticationRequired(feedEvent.ts, feedEvent.content);
        break;
      case AUTHENTICATION_FAILED:
        this.onAuthenticationFailed(feedEvent.ts, feedEvent.content);
        break;
      case LOGGED_OUT:
        this.onLogout(feedEvent.ts, feedEvent.content);
        break;
    }
  };

  // Events callbacks

  Feed.prototype.onReload = function(timestamp) {
    for (var i in this._handlers[RELOAD]) {
      this._handlers[RELOAD][i].call(this, timestamp);
    }
  };

  Feed.prototype.onEmpty = function(timestamp) {
    for (var i in this._handlers[EMPTY]) {
      this._handlers[EMPTY][i].call(this, timestamp);
    }
  };

  Feed.prototype.onEntryNew = function(timestamp, data) {
    entry = new Entry(data, {styler: this.stylerFunction});

    this.addEntry(entry);

    for (var i in this._handlers[ENTRY_NEW]) {
      this._handlers[ENTRY_NEW][i].call(this, timestamp, entry);
    }
  };

  Feed.prototype.onEntryInit = function(timestamp, entries) {
    for (var i in entries) {
      this.onEntryNew(timestamp, entries[i]);
    }

    for (var i in this._handlers[ENTRY_INIT]) {
      this._handlers[ENTRY_INIT][i].call(this, timestamp, entries);
    }
  };

  Feed.prototype.onEntryMore = function(timestamp, data) {
    entries = JSON.parse(data);

    for (var i in this._handlers[ENTRY_MORE]) {
      this._handlers[ENTRY_MORE][i].call(this, timestamp, entries);
    }
  };

  Feed.prototype.onHide = function(timestamp) {
    for (var i in this._handlers[HIDE]) {
      this._handlers[HIDE][i].call(this, timestamp);
    }
  };

  Feed.prototype.onShow = function(timestamp) {
    for (var i in this._handlers[SHOW]) {
      this._handlers[SHOW][i].call(this, timestamp);
    }
  };

  Feed.prototype.onEntryMessage = function(timestamp, content) {
    entryEvent = new Event(content);

    for (var i in this._handlers[ENTRY_MESSAGE]) {
      this._handlers[ENTRY_MESSAGE][i].call(this, timestamp, entryEvent);
    }
  };

  Feed.prototype.onAuthenticated = function(timestamp, content) {
    for (var i in this._handlers[AUTHENTICATED]) {
      this._handlers[AUTHENTICATED][i].call(this, timestamp);
    }
  };

  Feed.prototype.onAuthenticationRequired = function(timestamp, content) {
    for (var i in this._handlers[AUTHENTICATION_REQUIRED]) {
      this._handlers[AUTHENTICATION_REQUIRED][i].call(this, timestamp);
    }
  };

  Feed.prototype.onAuthenticationFailed = function(timestamp, content) {
    for (var i in this._handlers[AUTHENTICATION_FAILED]) {
      this._handlers[AUTHENTICATION_FAILED][i].call(this, timestamp);
    }
  };

  Feed.prototype.onLogout = function(timestamp, content) {
    for (var i in this._handlers[LOGGED_OUT]) {
      this._handlers[LOGGED_OUT][i].call(this, timestamp);
    }
  };

  // Feed management

  Feed.prototype.reload = function() {
    this.empty();
    this.socket.send({action: ENTRY_INIT, feedId: this.feedId, appId: this.appId, orgId: this.orgId});
  };

  Feed.prototype.loadMore = function() {
    this.socket.send({action: ENTRY_MORE, feedId: this.feedId, appId: this.appId, orgId: this.orgId, state: {}});
  };

  Feed.prototype.loadInit = function() {
    var self = this;
    this.channel.on('join', function() {
      if (self._state.initiated === true) {
        return;
      }

      self.socket.send({action: ENTRY_INIT, feedId: self.feedId, appId: self.appId, orgId: self.orgId});
      self._state.initiated = true;
    });
  };

  // Entries management

  Feed.prototype.addEntry = function(entry) {

    // types
    // add by: timestamp up/down; always to top; always to bottom

    entry.setParent(this);
    this.entryList.push(entry);

    this.outputContainer.innerHTML = '<div id="' + entry.getViewId() + '"></div>' + this.outputContainer.innerHTML;

    entry.render();
  };

  Feed.prototype.deleteEntry = function(entry) {
    entry.delete();
  };

  Feed.prototype.updateEntry = function(entry, data) {
  };

  Feed.prototype.empty = function() {
    for (var i in this.entryList) {
      this.deleteEntry(this.entryList[i]);
      delete this.entryList[i];
    }
    this.entryList = [];
  };

  Feed.prototype.findEntry = function(id) {
  };

  // UI

  Feed.prototype.render = function(id) {
    for (var i in this.entryList) {
      this.entryList[i].render();
    }
  };

  // Handlers

  Feed.prototype.bindChannel = function(channel) {
    var self = this;
    channel.on('message', function(chid, ts, systemEvent) {
      if (systemEvent.type == SYSTEM_FEED_MESSAGE) {
        feedEvent = new Event(systemEvent.content);
        if (feedEvent.user == self.feedId || feedEvent.user == '*') {
          self.onData(feedEvent);
        }
      }
    });
  };

  // Helpers

  var _extend = function(a, b) {
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

  return Feed;

})();
