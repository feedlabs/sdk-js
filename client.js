/*
 * Author: Feed Labs
 */

(function(window) {
  var FeedPlugin = {

    /** @type {Object} */
    objectList: {},

    /** @type {Array} */
    defaultEntryIds: [],

    /** @type {HTMLElement|Null} */
    outputContainer: null,

    /** @type {Object} */
    options: {
      feedId: '',
      outputContainerId: 'defaultContainerId',
      defaultElementLayout: '',
      defaultElementCount: 0
    },

    /**
     * @param {Object|Null} options
     * @param {Function|Null} stylerFunction
     * @param {Function|Null} updateFunction
     */
    init: function(options, stylerFunction, updateFunction) {
      this.options = this._extend(this.options, options);

      this._stylerFunction = stylerFunction || this._stylerFunction;
      this._updateFunction = updateFunction || this._updateFunction;

      this.outputContainer = document.getElementById(this.options.outputContainerId);

      this._addDefaultEntries();

      var _this = this;
      setTimeout(function() {
        FeedPlugin.load('http://www.feed.dev:10111/v1/feed/' + _this.options.feedId + '/entry', function(httpRequest) {
          _this._loadFirstEntries(JSON.parse(httpRequest.responseText));
        });
      }, 3000);
    },

    /**
     * @param {Array} firstEntries
     */
    _loadFirstEntries: function(firstEntries) {
      var _this = this;
      for (var key in firstEntries) {
        if (firstEntries.hasOwnProperty(key)) {
          var data = firstEntries[key];
          var realData = this._helperToGetRealData(data);
          _this.processData(realData);
        }
      }
      this._removeDefaultEntries();
    },

    _helperToGetRealData: function(data) {
      var realData = JSON.parse(data.Data);
      return realData['data']['data'];
    },

    _addDefaultEntries: function() {
      for (var i = 1; i <= this.options.defaultElementCount; i++) {
        var objectId = this._uniqueId();
        var entry = document.createElement('div');
        entry.id = objectId;
        entry.innerHTML = this.options.defaultElementLayout;
        this.outputContainer.appendChild(entry);

        this.defaultEntryIds.push(objectId);
      }
    },

    _removeDefaultEntries: function() {
      this.defaultEntryIds.forEach(function(id) {
        var domObject = document.getElementById(id);
        domObject.remove();
      });
    },

    /**
     * @param {Object} data
     */
    processData: function(data) {
      //debugger;
      if (data.action == 'add') {
        this.add(data.clientData);
      } else if (data.action == 'remove') {
        this.remove(data.clientData);
      } else if (data.action == 'update') {
        this.update(data.clientData);
      }
    },

    /**
     * @param {Object} clientData
     */
    add: function(clientData) {
      var objectId = this._uniqueId();

      this.objectList[objectId] = {
        id: objectId,
        clientId: clientData.id
        //hoverTime: 0
      };

      // create new DOM object
      var element = document.createElement('div');
      element.id = objectId;
      element.innerHTML = this._stylerFunction(clientData);

      // prepend to list
      this.outputContainer.insertBefore(element, this.outputContainer.firstChild);

      // add listener
      // var domObject = document.getElementById(objectId);
      // domObject.addEventListener('mouseover', this._onMouseover, true);
      // domObject.addEventListener('mouseout', this._onMouseout, true);
    },

    /**
     * @param {Object} clientData
     */
    remove: function(clientData) {
      var object = this.getObjectByClientId(clientData.id);
      var domObject = document.getElementById(object.id);
      // domObject.removeEventListener('mouseover', this._onMouseover, true);
      // domObject.removeEventListener('mouseout', this._onMouseout, true);
      domObject.remove();
      delete this.objectList[object.id];
    },

    /**
     * @param {Object} clientData
     */
    update: function(clientData) {
      var object = this.getObjectByClientId(clientData.id);
      this._updateFunction(object.id, clientData);
    },

    /**
     * @param {String} id
     * @returns {Object|Null}
     */
    getObjectById: function(id) {
      if (undefined !== this.objectList[id]) {
        return this.objectList[id];
      }
      return null;
    },

    /**
     * @param {String} id
     * @returns {Object|Null}
     */
    getObjectByClientId: function(id) {
      for (var key in this.objectList) {
        if (this.objectList.hasOwnProperty(key)) {
          var object = this.objectList[key];
          if (object.clientId == id) {
            return object;
          }
        }
      }
      return null;
    },

    //_onMouseover: function(event) {
    //  var object = FeedPlugin.getObjectById(event.target.id);
    //  object['mouseover'] = new Date().getTime();
    //},
    //
    //_onMouseout: function(event) {
    //  var object = FeedPlugin.getObjectById(event.target.id);
    //  if (object.hasOwnProperty('mouseover')) {
    //    var hoverTime = new Date().getTime() - object['mouseover'];
    //    object.hoverTime += hoverTime;
    //    console.log('"' + object.clientId + '" hover time: ' + hoverTime + '. Total hover time: ' + object.hoverTime);
    //    delete object['mouseover'];
    //  }
    //},

    /**
     * @param {Object} data
     * @returns {String}
     */
    _stylerFunction: function(data) {
      return JSON.stringify(data);
    },

    /**
     * @param {String} domElementId
     * @param {Object} data
     * @returns {String}
     */
    _updateFunction: function(domElementId, data) {
      console.log('No update function defined to process data: ');
      console.log(data);
      return '';
    },

    // Helpers
    // =======

    /**
     * @param {Object} a
     * @param {Object} b
     * @returns {Object}
     */
    _extend: function(a, b) {
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
    },

    _uniqueId: function() {
      return '_' + Math.random().toString(36).substr(2, 9);
    },


    load: function(url, callback) {
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
      xhr.onreadystatechange = ensureReadiness;
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

      xhr.open('GET', url, true);
      xhr.send('');
    }

  }; // FeedPlugin

  // ===========================================================================

  if ("function" === typeof define) {
    define(function(require) {
      return FeedPlugin;
    });
  } else {
    window.FeedPlugin = FeedPlugin;
  }
}(window));


// Helpers
// =======

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


// old stuff


//(function(window) {
//
//  var MyPlugin = {
//
//    handlers: {},
//    outputContainer: null,
//    // default options
//    options: {
//      custId: '007',
//      token: 'demo123#',
//      outputContainerId: 'defaultContainerId'
//    },
//    timer: null,
//    timer_count: 0,
//    data: [
//      {type: 1, name: 'foo', params: 'bar'},
//      {type: 2, name: 'foo', params: 'bar'}
//    ],
//
//    /**
//     * @param {Object} options
//     * @param {Function|Null} stylerFunction
//     */
//    init: function(options, stylerFunction) {
//      options = this._extend(this.options, options);
//      this._stylerFunction = stylerFunction || this._stylerFunction;
//
//      this.outputContainer = document.getElementById(options.outputContainerId);
//
//      this._connectToServer(options);
//
//      this._executeHandlers('init');
//    },
//
//    _connectToServer: function(options) {
//      // connect to server
//      // params (custId, token)
//      // if ok registerUser
//
//      this._registerUser();
//
//    },
//
//    _registerUser: function() {
//      // ??? some webSocket stuff
//      // will use setInterval()
//
//      var _this = this;
//
//
//      _this.printOutput(_this.data);
//      this.timer = setInterval(function() {
//        _this.timer_count += 1;
//        _this.printOutput(_this.data);
//      }, 10000);
//
//    },
//
//    /**
//     * @param {Object} data
//     */
//    printOutput: function(data) {
//      if (this.outputContainer) {
//        this.outputContainer.innerHTML = this._stylerFunction(data);
//      } else {
//        console.log('No `outputContainer` is defined. Add a container with `id=defaultContainerId` or pass a `outputContainerId` at init.');
//      }
//
//      this._executeHandlers('printOutput');
//    },
//
//    /**
//     * @param {String} eventName
//     * @param {Function} handler
//     * function which collects handlers
//     */
//    on: function(eventName, handler) {
//      // if no handler collection exists, create one
//      if (!this.handlers[eventName]) {
//        this.handlers[eventName] = [];
//      }
//      this.handlers[eventName].push(handler);
//    },
//
//    /**
//     * @param {Object} data
//     * @returns {String}
//     * @private
//     * default styler function
//     */
//    _stylerFunction: function(data) {
//      var html = '';
//      for (var key in data) {
//        if (data.hasOwnProperty(key)) {
//          html += JSON.stringify(data[key]) + '<br>';
//        }
//      }
//      return html;
//    },
//
//    /**
//     * @param {String} eventName
//     * @private
//     * internal function that executes handlers with a given name
//     */
//    _executeHandlers: function(eventName) {
//      // get all handlers with the selected name
//      var handler = this.handlers[eventName] || [], len = handler.length, i;
//      // execute each
//      for (i = 0; i < len; i++) {
//        // use apply to specify what "this" and parameters the callback gets
//        handler[i].apply(this, []);
//      }
//    },
//
//    // Helpers
//    // =======
//
//    /**
//     * @param {Object} a
//     * @param {Object} b
//     * @returns {Object}
//     * @private
//     * merge objects into new object
//     */
//    _extend: function(a, b) {
//      var c = {}, prop;
//      for (prop in a) {
//        if (a.hasOwnProperty(prop)) {
//          c[prop] = a[prop];
//        }
//      }
//      for (prop in b) {
//        if (b.hasOwnProperty(prop)) {
//          c[prop] = b[prop];
//        }
//      }
//      return c;
//    }
//
//  }; // MyPlugin
//
//  // ===========================================================================
//
//  if ("function" === typeof define) {
//    define(function(require) {
//      return MyPlugin;
//    });
//  } else {
//    window.MyPlugin = MyPlugin;
//  }
//
//}(window));
