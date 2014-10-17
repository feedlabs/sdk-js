if ( typeof define === "function" && define.amd ) {
  define( function () {
    return FeedPlugin;
  });
} else {
  global.FeedPlugin = FeedPlugin;
}
