var Metric = (function() {

  const METRIC_NEW = 1;

  const METRIC_VIEW_USER_SKIPPED = 100;
  const METRIC_VIEW_USER_WATCH_TIME = 200;
  const METRIC_VIEW_USER_SCROLL_TOP_BOTTOM = 300;
  const METRIC_VIEW_USER_SCROLL_TOP_BOTTOM_TOP = 301;
  const METRIC_VIEW_USER_SEARCH_VALUE = 400;
  const METRIC_VIEW_USER_CUSTOM = 900;

  const METRIC_ENTRY_USER_CLICK = 1000;
  const METRIC_ENTRY_USER_CLICK_LIKE = 1001;
  const METRIC_ENTRY_USER_CLICK_WATCH = 1002;
  const METRIC_ENTRY_USER_CLICK_STAR = 1003;
  const METRIC_ENTRY_USER_CLICK_CUSTOM = 1004;
  const METRIC_ENTRY_USER_HOVER = 1100;
  const METRIC_ENTRY_USER_HOVER_TIME = 1101;
  const METRIC_ENTRY_USER_CUSTOM = 1200;

  var globalOptions = {

    /** @type {Integer} */
    bufferSize: 16
  }

  function Metric(options, channel) {
    /** @type {Channel} */
    this.channel = channel;

    this.Init();

    /** @type {Object} */
    if (this.channel.options.transport == 'ws') {
      this.socket = this.channel.getWebSocketConnection();
    } else if (this.channel.options.transport == 'lp') {
      this.socket = this.channel.getLongPoolingConnection();
    }

    /** @type {Object} */
    this.options = _extend(globalOptions, options);

    /** @type {Object} */
    this._state = {
      initiated: false
    };

    /** @type {Object} */
    this.buffer = []
  }

  Metric.prototype.CreateViewMetric = function(entryList, userBehaviours) {
    return (function() {
      function MetricView(entryList, userBehaviours) {
        this.entryList = [];
        this.userBehaviours = [];
      }

      MetricView.prototype.AddEntry = function(entry) {
        this.entryList.push(entry)
      }

      MetricView.prototype.AddBehaviours = function(behaviour) {
        this.userBehaviours.push(behaviour)
      }
    })()
  }

  Metric.prototype.CreateEntryMetric = function(entry, userActions) {
    return {
      data: entryList,
      actions: userActions
    }
  }

  Metric.prototype.Commit = function(data) {
    this.buffer.push(data);
    if (this.buffer.length > this.options.bufferSize) {
      this.Push();
    }
  }

  Metric.prototype.Push = function() {
    if (self._state.initiated === true) {
      this.socket.send({action: METRIC_NEW, data: this.buffer});
      this.buffer = [];
    }
  }

  Metric.prototype.Init = function() {
    var self = this;
    this.channel.on('join', function() {
      if (self._state.initiated === true) {
        return;
      }

      self._state.initiated = true;
    });
  }

  return Metric;

})();
