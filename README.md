sdk-js
======

This is a javascript client for [elasticfeed](https://github.com/feedlabs/elasticfeed) server.

Elasticfeed
-----------
#### Global options
```js
{
  channel: {
    url: 'localhost',
    transport: 'ws'
  }
}
```

#### Init
```js
elasticfeed.init({
  channel: {
    url: 'ws://localhost:10100/stream/ws',
    transport: 'ws'
  }
});
```

#### Init new feed
```js
var feed = elasticfeed.initFeed('84:30:26', {
  outputContainerId: 'my-elastic-feed',
  stylerFunction: function(data) {
    return '<div>' + data + '</div>';
  }
});
```

#### Methods
##### initFeed(id, options)
Creates and returns `feed` instance (creates new `channel` if required).
##### getChannel(options)
Creates and returns `channel` instance.
##### findFeed(id)
Returns existing `feed` instance or `false` if does not exist.
##### findChannel(url)
Returns existing `channel` instance or `false` if does not exist.

Channel
-------
Supports three types of communication over `HTTP` protocol: WebSocket, Long pooling (XHR), SSE (Server Sent Events + XHR).

#### Options
```js
{
    transport: 'ws',
    host: 'localhost',
    port: '10100'
    url: ''
}
```

#### Create
```js
var channel = new Channel(options);
```

#### Events
```js
channel.on('join', function(chid, timestamp) {});
channel.on('leave', function(chid, timestamp) {});
channel.on('message', function(chid, timestamp, systemEvent) {});
```

Feed
----
#### Create
```javascript
var feed = new Feed(id, options, channel);
```

#### Events
```js
feed.on('reload', function(timestamp) {});
feed.on('empty', function(timestamp) {});
feed.on('entry', function(timestamp, Entry) {});
feed.on('entry-init', function(timestamp, []Entry) {});
feed.on('entry-more', function(timestamp, []Entry) {});
feed.on('entry-message', function(timestamp, entryEvent) {});
feed.on('hide', function(timestamp) {});
feed.on('show', function(timestamp) {});
feed.on('authenticated', function(timestamp) {});
feed.on('authentication-required', function(timestamp) {});
feed.on('authentication-failed', function(timestamp) {});
feed.on('logout', function(timestamp) {});
```

#### Methods
###### addEntry(entry)
###### deleteEntry(entry)
###### updateEntry(entry, data)
###### loadInit()
Sends request to the server
###### loadMore()
Sends request to the server
###### reload()
Empty feed and trigger initial load.
###### empty()
Removes entries from feed and DOM
###### render()
Refresh entries in the DOM.

Entry
-----
#### Create
```js
var entry = new Entry(data, options);
```

#### Events
```js
entry.on('update', function(timestamp, data) {});
entry.on('delete', function(timestamp) {});
entry.on('hide', function(timestamp) {});
entry.on('show', function(timestamp) {});
```

#### Methods
###### setParent(feed)
Set parent of type feed and binds to the messages stream on the feed.
###### bindMessages()
Bind to the event `entry-message` on the parent feed object. 
###### unbindMessages()
Unbind from the event `entry-message`.
###### render()
Refresh object in the DOM.

Event
-----
Represents states of communication levels. There are `channelEvent`, `systemEvent`, `feedEvent` and `entryEvent`.

Development
-----------
Type `grunt watch` to produce dist files for each change.

Build
-----
Type `grunt` to build distribution files.

License
-------
MIT
