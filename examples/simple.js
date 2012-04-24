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

var keys = ['callback1', 'callback2']

var vals = [
    'testing callback1'
  , 'testing callback2'
]

cache
.msave(arr)

function callback (err, value) {
  if (err) throw err

  console.log(value)
}

function miss (done) {
  console.log('miss', keys[0])
  done(null, [keys[0], vals[0]], vals[0])
}

cache
.get(['callback1', 'callback4'])
.miss(function(add, done) {
  console.log('miss', 'callback3')
  add('callback1', 'value1')
  add('callback4', 'value4')
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
