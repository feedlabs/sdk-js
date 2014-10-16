/**
 * feedlabs-sdk-js - This is the js sdk for products of Feed Labs
 * @version v0.0.1
 * @link http://www.feedlabs.io
 * @license MIT
 */

var test = 12345;

;
(function(window) {




  if ("function" === typeof define) {
    define(function(require) {
      return FeedPlugin;
    });
  } else {
    window.FeedPlugin = FeedPlugin;
  }
}(window));

var test = 12345;
