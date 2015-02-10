sdk-js
======

This is a javascript client for [elasticfeed](https://github.com/feedlabs/elasticfeed) server.

Elasticfeed
-----------
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

Channel
-------
#### Options
```js
{
    id: null,
    transport: 'ws',
    host: 'localhost',
    port: '10100'
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
