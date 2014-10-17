/** @type {Object} */
var defaultOptions = {
  feedId: '',
  outputContainerId: 'defaultContainerId',
  defaultElementLayout: '',
  defaultElementCount: 0,
  defaultElementShowTime: 300
};

/**
 * @param {Object} options
 * @param {Function} stylerFunction
 * @constructor
 */
var FeedPlugin = function(options, stylerFunction) {

  /** @type {Object} */
  this.options = this._extend(defaultOptions, options);

  /** @type {Function} */
  this.stylerFunction = stylerFunction || this._stylerFunction;

  /** @type {Object} */
  this.objectList = {};

  /** @type {Array} */
  this.defaultEntryIds = [];

  /** @type {HTMLElement|Null} */
  this.outputContainer = document.getElementById(this.options.outputContainerId);

  this._addDefaultEntries();
  this.initFeedPage();
  this._bindToStream();
};
