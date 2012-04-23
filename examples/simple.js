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
.get(keys[0], callback)

cache
.get(keys[0])
.run(callback)

cache
.get(keys[0], miss, callback)

cache
.get(keys[0])
.miss(miss)
.run(callback)

cache
.get('callback3')
.miss(function(done) {
  console.log('miss', 'callback3')
  done(null, ['callback3', 'testing callback3'], 'testing callback3')
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
