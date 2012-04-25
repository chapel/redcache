var redis = require('redis')

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

Redcache.prototype.save = function (arg, callback) {
  var key = this._key(arg.key)

  this._redis.setex(key, this._ttl, arg.value, callback)
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

Redcache.prototype.expire = function(key, callback) {
  var _key = this._key(key)

  this._redis.expire(_key, this._ttl, callback)
}

Redcache.prototype.mexpire = function(args, callback) {
  var multi = this._redis.multi()
    , key

  for (var i = 0; i < args.length; i+=1) {
    key = args[i]
    multi.expire(this._key(key), this._ttl)
  }

  multi.exec(callback)
}

function ChainCallback () {
  var chain            = {}
  chain.args           = Array.prototype.slice.call(arguments)
  chain.argKV          = []
  chain.keyValues      = {}
  chain.values         = []
  chain.missedKeys     = {}
  chain.returnedValues = {}

  chain.redcache  = chain.args.shift()

  function composeKV() {
    var missed = []
      , keys   = Object.keys(chain.missedKeys)

    function save(obj) {
      return function(value) {
        chain.keyValues[obj.key] = value
        chain.argKV.push({key: obj.key, value: value})
      }
    }

    for (var i = 0; i < keys.length; i+=1) {
      missed[i] = {key: keys[i], save: save({key: keys[i], index: chain.missedKeys[keys[i]].index})} 
    }

    missed = missed.length > 1 ? missed : missed[0]

    return missed
  }

  chain.composeValues = function() {
    var values   = []
      , returned = chain.returnedValues
      , missed   = chain.missedKeys
      , kv       = chain.keyValues

    for (var k in returned) {
      if (returned[k].value) values[returned[k].index] = returned[k].value
    }

    for (var j in missed) {
      if (kv[j]) values[missed[j].index] = kv[j]
    }

    return values.length > 1 ? values : values[0]
  }

  chain.miss = function(miss) {
    chain._miss = function(done) {
      miss(composeKV(), done)
    }
    return chain
  }

  chain.check = chain.args.pop()

  chain.fn = chain.args.pop()

  chain.run = function (callback) {
    chain.callback = callback

    chain.args.push(chain.check)
    chain.fn.apply(chain.redcache, chain.args)
  }

  return chain
}

// TODO - Clean up this mess

Redcache.prototype.get = function (key) {
  var self = this;

  var fn = Array.isArray(key) ? this.mfetch : this.fetch

  var chain = new ChainCallback(self, key, fn, function(err, values) {
    if (err) return chain.callback(err)

    var _values = []

    if (Array.isArray(values)) {
      for (var i = 0; i < values.length; i+=1) {
        if (values[i]) chain.returnedValues[key[i]] = {index: i, value: values[i]}
        else chain.missedKeys[key[i]] = {index: i}
      }
    } else {
      if (values) chain.returnedValues[key] = {index: 0, value: values}
      else chain.missedKeys[key] = {index: 0}
    }

    if (chain._miss) {
      if (Object.keys(chain.missedKeys).length > 0) {
        return chain._miss(function processMissed(err) {
          if (err) return chain.callback(err)

          var savefn = chain.argKV.length > 1 ? self.msave : self.save
          var args = chain.argKV.length > 1 ? [chain.argKV] : chain.argKV
          savefn.apply(self, args)

          finish()
        })
      }
    } else if (Object.keys(chain.missedKeys).length > 0) {
      return chain.callback(null, null)
    }

    if (Object.keys(chain.returnedValues).length > 0) {
      var returned = Object.keys(chain.returnedValues)
      var expirefn = returned.length > 1 ? self.mexpire : self.expire
      var args = returned.length > 1 ? [returned] : returned
      expirefn.apply(self, args)
    }

    function finish() {
      _values = chain.composeValues()

      chain.callback(null, _values)
    }

    finish()

  })


  Redcache.prototype.end = function () {
    this._redis.end()
  }

  var args = Array.prototype.slice.call(arguments)
    , callback

  if (args.length > 1) {
    callback = args.pop()

    if (args.length > 1) {
      chain.miss(args.pop())
    }

    if (typeof callback === 'function') {
      chain.run(callback)
    }
  }

  return chain
}

exports.create = function(config) {
  var redis_client

  config = config || {}

  if (config.debug) redis.debug_mode = true

  // TODO - Pass in redis client through config.client
  redis_client = redis.createClient(config.port, config.host, config.options)

  if (config.auth) redis_client.auth(config.auth)
  
  return new Redcache(redis_client, config)
}
