/**
 * @param {String} url
 * @param {Function} callback
 * @private
 */
FeedPlugin.prototype._load = function(url, callback) {
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

/**
 * @returns {String}
 * @private
 */
FeedPlugin.prototype._uniqueId = function() {
  return '_' + Math.random().toString(36).substr(2, 9);
};

/**
 *
 * @param {Object} a
 * @param {Object} b
 * @returns {Object}
 * @private
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
