# redis-cache

Super simple redis-based single-lookup caching for Node.js designed as a temporary storage for Hook.io

## Install

```bash
$ npm install redis-cache
```

## Usage

Example using Hook.io (obviously very simplified)

##### hook-one.js

```javascript
var cache = require('redis-cache');

cache.init('redis://...');

hook.emit('doSomething', 'data', function(err, key) {
	if (err) {...}
	cache.fetch(key, function(err, reallyBigResult) {
		if (err) {...}
		
		// ...
		
	});
});
```

##### hook-two.js

```javascript
var cache = require('redis-cache');

cache.init('redis://...');

hook.on('*::doSomething', function(data, callback) {
	doSomething(data, function(err, reallyBigResult) {
		if (err) {...}
		cache.store(reallyBigResult, function(err, key) {
			if (err) {...}
			callback(null, key);
		});
	});
});
```

