var Viewer = (function() {

  var globalOptions = {}

  function Viewer(profile, options) {

    /** @type {Object} */
    this.profile = profile;

    /** @type {Object} */
    this.options = _extend(globalOptions, options);
  }

  Viewer.prototype.InitEyeHeatMap = function() {}

  Viewer.prototype.InitClickHeatMap = function() {}

  Viewer.prototype.InitScrollingHeatMap = function() {}

  Viewer.prototype.GetIP = function() {}

  Viewer.prototype.GetLocation = function() {}

  Viewer.prototype.GetEnvOS = function() {}

  Viewer.prototype.GetEnvBrowser = function() {}

  return Viewer;

})();
