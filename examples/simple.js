var redcache = require('../index')
  , redis = require('redis')
  , client = redis.createClient()

var cache = redcache.create({prepend: 'local', ttl: 100})

var arr = [
    { key:'callback1'
    , value:'testing callback1'
    }
  , { key:'callback2'
    , value:'testing callback2'
    }
]

var keys = ['local:callback1', 'local:callback2']

var vals = [
    'testing callback1'
  , 'testing callback2'
]

cache
.msave(arr)

function callback (err, value) {
  if (err) throw err

  console.log(value)
  keys.push('local:callback4')
  client.del(keys)
}

function miss (done) {
  console.log('miss', keys[0])
  done(null, [keys[0], vals[0]], vals[0])
}

cache
.get(['callback1', 'callback4'])
.miss(function(keys, add, done) {
  for (var i = 0; i < keys.length; i+=1) {
    add(keys[i], 'value4')
  }
  done(null)
})
.run(callback)

/*
cache.get(keys, function(err, values) {
  console.log(values)
})

cache.get('callback1').exec(function(err, values) {
  console.log(values)
})

cache.get(keys).run(function(err, values) {
  console.log(values)
})
*/
