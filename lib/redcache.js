var redis = require('redis')
  , redcache

function Redcache (redis_client, config) {
  var self      = this

  self._redis   = redis_client
  self._config  = config
  self._prepend = config.prepend || 'cache'
  self._ttl     = config.ttl || 10 * 60

  debugger;
  self._noop    = function(){};
}

Redcache.prototype._key = function(key) {
  return this._prepend + ':' + key
}

Redcache.prototype.fetch = function (key, callback) {
  var _key = this._key(key)

  this._redis.get(_key, callback)
}

Redcache.prototype.mfetch = function (keys, callback) {
  var _keys = []
  for (var i = 0; i < keys.length; i+=1)
    _keys[i] = this._key(keys[i])

  this._redis.mget(_keys, callback)
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

function ChainCallback () {
  var chain = {}
  chain.args = Array.prototype.slice.call(arguments)

  chain.miss = function(miss) {
    chain._miss = function(done) {
      miss(done)
    }
    return chain
  }

  chain.check = chain.args.pop()

  chain.fn = chain.args.pop()

  chain.run = function (callback) {
    debugger;
    chain.callback = callback

    chain.args.push(chain.check)
    debugger;
    chain.fn.apply(redcache, chain.args)
    debugger;
  }

  return chain
}

Redcache.prototype.get = function (key) {
  var fn = Array.isArray(key) ? this.mfetch : this.fetch
  var savefn = Array.isArray(key) ? this.msave : this.save
  var chain = new ChainCallback(key, fn, function(err, values) {
    if (err) return chain.callback(err)

    debugger;
    if (!values && chain._miss) {
      return chain._miss(function(err, saveVals, values) {
        if (err) return chain.callback(err)

        savefn.apply(redcache, saveVals)
        chain.callback(null, values)
      })
    }

    debugger;
    chain.callback(null, values)
  })

  var args = Array.prototype.slice.call(arguments)
    , callback

  if (args.length > 1) {
    callback = args.pop()

    if (args.length > 1)
      chain.miss(args.pop())

    if (typeof callback === 'function')
      debugger;
      chain.run(callback)
  }

  return chain
}

exports.create = function(config) {
  var redis_client

  config = config || {}
  redis_client = redis.createClient(config.port, config.host, config.options)

  if (config.auth) redis_client.auth(config.auth)
  
  redcache = new Redcache(redis_client, config)

  return redcache
}