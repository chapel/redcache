var redis = require('redis')
  , redcache

function Redcache (redis_client, config) {
  var self      = this

  self._redis   = redis_client
  self._config  = config
  self._prepend = config.prepend || 'cache'
  self._ttl     = config.ttl || 10 * 60

  self._noop    = function(){};
}

Redcache.prototype._key = function(key) {
  return this._prepend + ':' + key
}

function ChainCallback () {
  var chain = {}
  chain.args = Array.prototype.slice.call(arguments)

  chain.capturedFn = chain.args.pop()

  chain.exec = function (callback) {
    chain.args.push(callback)
    var fn = chain.capturedFn.bind(redcache._redis, chain.args)
    fn()
  }

  return chain
}

Redcache.prototype.fetch = function (key, callback) {
  var _key = this._key(key)

  var chain = new ChainCallback(_key, this._redis.get)

  if (typeof callback === 'function')
    chain.exec(callback)

  return chain
}

Redcache.prototype.mfetch = function (keys, callback) {
  var _keys = []
  for (var i = 0; i < keys.length; i+=1)
    _keys[i] = this._key(keys[i])

  var chain = new ChainCallback(_keys, this._redis.mget)

  if (typeof callback === 'function')
    chain.exec(callback)

  return chain
}

Redcache.prototype.save = function (key, value, callback) {
  key = this._key(key)

  this._redis.setex(key, this._ttl, value, callback)
}

Redcache.prototype.msave = function (args, callback) {
  var multi = this._redis.multi()
    , arg

  for (var i = 0; i < args.length; i+=1) {
    arg = args[i]
    multi.setex(this._key(arg.key), this._ttl, arg.value)
  }

  multi.exec(callback)
}

Redcache.prototype.get = function (key, miss, callback) {
  if (Array.isArray(key)) {
    this._noop()
  }
  key = this._key(key)

  //this.
}

exports.create = function(config) {
  var redis_client

  config = config || {}
  redis_client = redis.createClient(config.port, config.host, config.options)

  if (config.auth) redis_client.auth(config.auth)
  
  redcache = new Redcache(redis_client, config)

  return redcache
}
