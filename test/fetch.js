var redis = require('redis')
  , redcache = require('../')
  , cache = redcache.create({prepend: 'test:fetch', ttl: 100})
  , client = redis.createClient()
  , vals = ['testing callback', 'testing chained callback']

describe('Fetch', function() {
  before(function(done) {
    client.multi()
    .setex(
        cache._key('callback')
      , 100
      , vals[0]
    )
    .setex(
        cache._key('chainedcallback')
      , 100
      , vals[1]
    )
    .exec(done)
  })

  describe('single key', function() {
    it('should fetch value and callback', function(done) {
      cache
      .fetch('callback', function(err, value) {
        if (err) throw err

        value.should.equal(vals[0])
        done()
      })
    })
  })

  describe('multiple keys', function() {
    it('should fetch values and callback', function(done) {
      cache
      .mfetch(['callback', 'chainedcallback'], function(err, values) {
        if (err) throw err

        values.should.include(vals[0])
        values.should.include(vals[1])
        done()
      })
    })
  })
})
