FeedPlugin.prototype.initFeedPage = function() {
  var _this = this;
  setTimeout(function() {
    _this._loadFeedPage();
  }, this.options.defaultElementShowTime);
};

/**
 * @private
 */
FeedPlugin.prototype._loadFeedPage = function() {
  var _this = this;
  var url = 'http://www.feedify.dev:10111/v1/feed/' + _this.options.feedId + '/entry';
  _this._load(url, function(httpRequest) {
    var entryList = (JSON.parse(httpRequest.responseText));
    for (var key in entryList) {
      if (entryList.hasOwnProperty(key)) {
        var data = entryList[key];
        _this.add(data);
      }
    }
    _this._removeDefaultEntries();
  });
};

/**
 * @private
 */
FeedPlugin.prototype._bindToStream = function() {
  var _this = this;
  var socketRedisClient = this.getSocketRedisClient();
  socketRedisClient.subscribe('iO5wshd5fFE5YXxJ/hfyKQ==:17', new Date().getTime(), {sessionId: "55e10ffb7ba3ca6d8fd39f25cd64253d"}, function(event, data) {
    _this.processData(data.data);
  });
};
