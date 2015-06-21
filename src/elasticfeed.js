(function(window) {

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

    /** @type {Object} */
    viewerList: {},

    /** @type {Object} */
    metricProviderList: {},

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

        if (opts.metric === undefined) {
          opts.metric = opts.channel;
        }

        metricProvider = this.getMetricProvider(opts.metric)

        this.feedList[id] = new Feed(id, opts, channel, metricProvider);
      }

      return this.feedList[id];
    },

    getMetricProvider: function(options) {
      if (options.url === undefined) {
        return false;
      }

      if (this.metricProviderList[options.url] === undefined) {
        opts = _extend(this.options, options || {});
        channel = this.getChannel(options);

        this.metricProviderList[options.url] = new Metric(opts, channel);
      }

      return this.metricProviderList[options.url];
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

    /**
     * Returns Viewer defined per UID
     * @param profile
     * @param options
     * @returns {*}
     */
    getViewer: function(profile, options) {
      if (profile.uid === undefined) {
        return false;
      }

      if (this.viewerList[profile.uid] === undefined) {
        this.viewerList[profile.uid] = new Viewer(profile, options);
      }

      return this.viewerList[profile.uid];
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
    },

    findViewer: function(uid) {
      if (this.viewerList[url] === undefined) {
        return false;
      }
      return this.viewerList[uid];
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
