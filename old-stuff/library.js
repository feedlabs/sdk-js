;
(function(global) {

  function initLibraryCore(context) {
    'use strict';

    // An example of a CONSTANT variable;
    //var CORE_CONSTANT = true;


    // PRIVATE MODULE METHODS
    //function corePrivateMethod(aNumber) {
    //  return aNumber;
    //}



    //var Library = context.Library = function(opt_config) {
    //
    //  opt_config = opt_config || {};
    //
    //  this._readOnlyVar = 'read only';
    //  this.readAndWrite = 'read and write';
    //
    //  return this;
    //};


    var FeedPlugin = context.FeedPlugin = function(options, stylerFunction) {

      options = options || {};

      /** @type {Object} */
      this.objectList = {};

      /** @type {Array} */
      this.defaultEntryIds = [];

      /** @type {HTMLElement|Null} */
      this.outputContainer = null;

      /** @type {Object} */
      this.options = {
        feedId: '',
        outputContainerId: 'defaultContainerId',
        defaultElementLayout: '',
        defaultElementCount: 0
      };

      this.options = this._extend(this.options, options);
      this._stylerFunction = stylerFunction || this._stylerFunction;
      this.outputContainer = document.getElementById(this.options.outputContainerId);
      this._addDefaultEntries();
      //setTimeout(function() {
      //  FeedPlugin.load('http://www.feed.dev:10111/v1/feed/' + _this.options.feedId + '/entry', function(httpRequest) {
      //    _this._loadFirstEntries(JSON.parse(httpRequest.responseText));
      //  });
      //}, 1500);
      return this;

    };


      /**
       * @param {Object} data
       */
      FeedPlugin.prototype.processData = function(data) {
        switch (data.Action) {
          case 'add':
            this.add(data);
            break;
          case 'remove':
            this.remove(data);
            break;
          case 'update':
            this.update(data);
            break;
          default:
            console.log('Unknown action `' + data.Action + '`');
        }
      };

      /**
       * @param {Object} data
       */
      FeedPlugin.prototype.add = function (data) {
        var objectId = data.Id;
        this.objectList[objectId] = objectId;

        var domElement = document.createElement('div');
        domElement.id = objectId;
        domElement.innerHTML = this._stylerFunction(data.Data);

        this.outputContainer.insertBefore(domElement, this.outputContainer.firstChild);
      };

      /**
       * @param {Object} data
       */
      FeedPlugin.prototype.remove = function (data) {
        var domElement = document.getElementById(data.Id);
        domElement.remove();
        delete this.objectList[data.Id];
      };

      /**
       * @param {Object} data
       */
      FeedPlugin.prototype.update = function (data) {
        var domElement = document.getElementById(data.Id);
        domElement.innerHTML = this._stylerFunction(data.Data);
      };



    /**
     * @param {Object} firstEntries
     */
    FeedPlugin.prototype._loadFirstEntries = function (firstEntries) {
      var _this = this;
      for (var key in firstEntries) {
        if (firstEntries.hasOwnProperty(key)) {
          var data = firstEntries[key];
          _this.add(data);
        }
      }
      this._removeDefaultEntries();
    };

    FeedPlugin.prototype._addDefaultEntries = function () {
      for (var i = 1; i <= this.options.defaultElementCount; i++) {
        var objectId = _uniqueId();
        var entry = document.createElement('div');
        entry.id = objectId;
        entry.innerHTML = this.options.defaultElementLayout;
        this.outputContainer.appendChild(entry);

        this.defaultEntryIds.push(objectId);
      }
    };

    FeedPlugin.prototype._removeDefaultEntries = function () {
      this.defaultEntryIds.forEach(function(id) {
        var domObject = document.getElementById(id);
        domObject.parentNode.removeChild(domObject);
      });
    };

    /**
     * @param {Object} data
     * @returns {String}
     */
    FeedPlugin.prototype._stylerFunction = function (data) {
      return JSON.stringify(data.Data);
    };

    // Helpers
    // =======

    /**
     * @param {Object} a
     * @param {Object} b
     * @returns {Object}
     */
    FeedPlugin.prototype._extend = function (a, b) {
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

    FeedPlugin.prototype._uniqueId = function () {
      return '_' + Math.random().toString(36).substr(2, 9);
    };





    FeedPlugin.prototype.load = function(url, callback) {
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
  }


  function initLibraryModule(context) {
    //'use strict';
    //
    //var Library = context.Library;
    //// PRIVATE MODULE CONSTANTS
    //var MODULE_CONSTANT = true;
    //
    //
    //// PRIVATE MODULE METHODS
    //function modulePrivateMethod() {
    //  return;
    //}
    //
    //Library.LibraryHelper = function() {
    //  return this;
    //};
    //
    //Library.prototype.alternateGetReadOnlyVar = function() {
    //  return this._readOnlyVar;
    //};
  }

  var initLibrary = function(context) {

    initLibraryCore(context);
    initLibraryModule(context);

    return context.Library;
  };

  if (typeof define === 'function' && define.amd) {
    // Expose Library as an AMD module if it's loaded with RequireJS or
    // similar.
    define(function() {
      return initLibrary({});
    });
  } else {
    // Load Library normally (creating a Library global) if not using an AMD
    // loader.
    initLibrary(this);
  }

}(this));
