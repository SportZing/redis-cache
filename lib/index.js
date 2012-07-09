
var uuid   = require('uuid-v4');
var redis  = require('redis-url');

exports.init = function(url) {
	var client = redis.connect(url);
	
	exports.store = function(value, callback) {
		var id = uuid();
		// We only store string values
		if (typeof value !== 'string') {
			value = String(value);
		}
		// Store the value in redis
		client.set(id, value, function(err) {
			if (err) {
				return callback(err);
			}
			callback(null, id);
		});
	};
	
	exports.fetch = function(id, callback) {
		// Read the value from redis
		client.get(id, function(err, value) {
			if (err) {
				return callback(err);
			}
			callback(null, value);
			// Delete the key when we have free time
			process.nextTick(function() {
				exports.unset(id, function(err) {
					if (err) {
						if (err instanceof Error) {
							err = err.stack;
						}
						console.error(err);
					}
				});
			});
		});
	};
	
	exports.unset = function(id, callback) {
		client.del(id, callback);
	};
	
};

// ------------------------------------------------------------------

exports.store = function() {
	throw 'redis-cache must be initialized before use';
};

exports.fetch = function() {
	throw 'redis-cache must be initialized before use';
};

exports.unset = function() {
	throw 'redis-cache must be initialized before use';
};

