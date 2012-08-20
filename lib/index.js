
var uuid   = require('uuid-v4');
var redis  = require('redis-url');

exports.init = function(conf) {
	
	// If a string was given for conf, assume it is a redis url
	if (typeof conf === 'string') {
		conf = { url: conf };
	}
	
	// Create the redis client
	var client = redis.connect(conf.url);
	
	/**
	 * Store a new value
	 */
	exports.store = function(value, callback) {
		var id = uuid();
		// We only store string values
		value = JSON.stringify(value);
		// Store the value in redis
		client.set(id, value, function(err) {
			if (err) {
				return callback(err);
			}
			// Cause key to expire after a set amount of time
			expire(id, function(err) {
				if (err) {
					return callback(err);
				}
				callback(null, id);
			});
		});
	};
	
	/**
	 * Fetch a stored value, removing from the cache
	 */
	exports.fetch = function(id, callback) {
		// Handle short-hand notation
		if (arguments.length === 1 && typeof id === 'function') {
			callback = id;
			return function(err, key) {
				if (err) {
					return callback(err);
				}
				exports.fetch(key, callback);
			};
		}
		// Read the value from redis
		client.get(id, function(err, value) {
			if (err) {
				return callback(err);
			}
			callback(null, JSON.parse(value));
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
	
	/**
	 * Remove a value from the cache
	 */
	exports.unset = function(id, callback) {
		client.del(id, callback);
	};
	
	/**
	 * Sets the expiration on a value if configured
	 */
	var expire = conf.expire
		? function(key, callback) {
			client.expire(key, conf.expire, callback);
		}
		: function(key, callback) {
			process.nextTick(callback);
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

