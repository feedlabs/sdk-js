if ("function" === typeof define) {
  define(function() {
    return FeedPlugin;
  });
} else {
  window.FeedPlugin = FeedPlugin;
}
