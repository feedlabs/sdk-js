var Entry = (function() {

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
