var redcache = require('../')
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
