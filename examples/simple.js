var redcache = require('../index')
  , redis = require('redis')
  , client = redis.createClient()

var cache = redcache.create({prepend: 'local'})

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

cache
.get('callback1', function(err, value) {
  if (err) throw err

  console.log(value)
})

cache.get(keys, function(err, values) {
  console.log(values)
})

cache.get('callback1').exec(function(err, values) {
  console.log(values)
})

cache.get(keys).exec(function(err, values) {
  console.log(values)
})

