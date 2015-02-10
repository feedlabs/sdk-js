sdk-js
======

This is a javascript client for [elasticfeed](https://github.com/feedlabs/elasticfeed) server.

Channel
-------
#### Options
```json
{
    id: null,
    transport: 'ws',
    host: 'localhost',
    port: '10100'
}
```

#### Create
```javascript
var channel = new Channel();
```

#### Events
```
channel.on('join', function(chid, timestamp) {});
channel.on('leave', function(chid, timestamp) {});
channel.on('message', function(chid, timestamp, data) {});
```

Event
-----

Feed
----

Entry
-----

Development
-----------
Type `grunt watch` to produce dist files for each change.

Build
-----
Type `grunt` to build distribution files.

License
-------
MIT
