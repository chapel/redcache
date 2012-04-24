redcache
========
An easy to use Redis backed cache using [node_redis](https://github.com/mranney/node_redis) that allows you to leverage Redis as a [LRU cache](http://antirez.com/post/redis-as-LRU-cache.html).

Install with:

```
npm install redcache
```

Usage
-----
A simple example showing single and multi-key cache gets, included as ```examples/simple.js```:

```
var redcache = require('redcache')
  , cache    = redcache.create()

function db (key, callback) {
  var example = {
      key: 'value'
    , key2: 'value2'
    , key3: 'value3'
  }

  callback(null, example[key])
}

cache
.get('key')
.miss(function(missed, done) {
  // This function is called when a key
  // is not found in the cache.

  db(missed.key, function(err, value) {
    // Anything passed to done will be
    // interpreted as an error and immediately
    // sent to the final run callback as
    // an error.
    if (err) return done(err)

    missed.save(value)
    done()
  })
})
.run(function(err, value) {
  if (err) throw err

  console.log(value)
})

cache
.get(['key2', 'key3'])
.miss(function(missed, done) {
  // In the case of passing an array of keys
  // missed can be either an array or a single
  // object like above.

  if (missed.length) {
    var len = missed.length

    missed.forEach(function(missed, i) {
      db(missed.key, function(err, value) {
        if (err) return done(err)

        missed.save(value)
        if (i >= len) done()
      })
    })
  } else {
    db(missed.key, function(err, value) {
      if (err) return done(err)

      missed.save(value)
      done()
    })
  }

})
.run(function(err, values) {
  if (err) throw err

  console.log(values)
})
```

Which will display:

```
value
[ 'value2', 'value3' ]
```

API
===

cache.create(config)
---
Creates a new connection to the Redis cache. Config is an object that holds various configuration options.

* ```port```: Defaults to ```6379``` unless specified.
* ```host```: Defaults to ```127.0.0.1``` unless specified. 
* ```options```: These options are passed to [node_redis](https://github.com/mranney/node_redis) when creating the client. (See node_redis readme for more info)
* ```auth```: If set, it will be used for creating the Redis client connection.

cache.get(keys)
---
Redcache is built to be simple and flexible in how you use the API.

It supports both inline miss and run callbacks:

```
cache.get('key', function(missed, done) {
  // miss function
  missed.save('value')
  done()
}, function(err, value) {
  // run callback
})
```

As well as chained miss and run callbacks:

```
cache
.get('key')
.miss(function(missed, done) {
  // miss function
  missed.save('value')
  done()
})
.run(function(err, value) {
  // run callback
})
```

You can also completely omit the miss function, and recache will return the values as if you were directly calling redis, null values and all.

Inline callback:

```
cache.get('key', function(err, value) {
  // run callback
})
```

Chained callback:

```
cache
.get('key')
.run(function(err, value) {
  // run callback
})
```

It also is flexible concerning what keys you query, supporting a single key, or an array of keys.

```
cache.get('single_key')
cache.get(['multiple', 'keys'])
```

cache.get(keys).miss(missed, done)
---
The miss function allows you to retrieve keys not found in the cache and be able to save them as well as then pass them to your final callback.

**What you do in the miss function is of your control, it is completely asynchronous, and if you do not call ```done()``` your final callback will not be run.**


```
cache
.get('key')
.miss(function(missed, done) {
  db.find(missed.key, function(err, value) {
    if (err) return done(err)
    
    missed.save(value)
    done()
  })
})
.run(function(err, value) {
  // do something here
})
```

```missed``` can be either a single object, or an array of objects representing the missing keys. This allows you to do a simple check if it is an array and to handle retrieving the values accordingly.

It comes with two fields:

* ```key```: String type key that was not in the cache.
* ```save```: Function that takes a value and saves it to the cache with the proper key.

```done``` is a simple callback function that signifies that you are done processing the missed values. If anything is passed to it, it will immediately run the final callback with that as the error. Otherwise, it will run the final callback and pass the missed values that you saved to the final callback.

client.end()
---
Ends the client connection to Redis.

TODO
===
See [Issues](https://github.com/chapel/redcache/issues) for current list of TODO items.

License
===
Copyright (c) 2012 Jacob Chapel

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.