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
FeedPlugin.prototype.add = function(data) {
  var objectId = data.Id;
  this.objectList[objectId] = objectId;

  var domElement = document.createElement('div');
  domElement.id = objectId;
  domElement.innerHTML = this.stylerFunction(data.Data);

  this.outputContainer.insertBefore(domElement, this.outputContainer.firstChild);
};

/**
 * @param {Object} data
 */
FeedPlugin.prototype.update = function(data) {
  var domElement = document.getElementById(data.Id);
  domElement.innerHTML = this.stylerFunction(data.Data);
};

/**
 * @param {Object} data
 */
FeedPlugin.prototype.remove = function(data) {
  var domElement = document.getElementById(data.Id);
  domElement.remove();
  delete this.objectList[data.Id];
};
