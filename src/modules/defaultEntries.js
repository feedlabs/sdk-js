FeedPlugin.prototype._addDefaultEntries = function() {
  for (var i = 1; i <= this.options.defaultElementCount; i++) {
    var objectId = this._uniqueId();
    var entry = document.createElement('div');
    entry.id = objectId;
    entry.innerHTML = this.options.defaultElementLayout;
    this.outputContainer.appendChild(entry);

    this.defaultEntryIds.push(objectId);
  }
};

FeedPlugin.prototype._removeDefaultEntries = function() {
  this.defaultEntryIds.forEach(function(id) {
    var domObject = document.getElementById(id);
    if (domObject) {
      domObject.parentNode.removeChild(domObject);
    }
  });
};
