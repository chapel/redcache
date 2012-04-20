var redis = require('redis')
  , redcache = require('../')
  , cache = redcache.create({prepend: 'test:fetch', ttl: 100})
  , client = redis.createClient()
  , vals = ['testing callback', 'testing chained callback']

describe('Fetch', function() {
  before(function() {
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
    .exec()
  })

  describe('single key', function() {
    describe('with a callback', function() {
      it('should fetch value and callback', function(done) {
        cache
        .fetch('callback', function(err, value) {
          if (err) throw err

          value.should.equal(vals[0])
          done()
        })
      })
    })

    describe('with chained callback', function() {
      it('should fetch value and callback', function(done) {
        cache
        .fetch('chainedcallback')
        .exec(function(err, value) {
          if (err) throw err

          value.should.equal(vals[1])
          done()
        })
      })
    })
  })

  describe('multiple keys', function() {
    describe('with a callback', function() {
      it('should fetch values and callback', function(done) {
        cache
        .mfetch(['callback', 'chainedcallback'], function(err, value) {
          if (err) throw err

          values.should.include(vals[0])
          values.should.include(vals[1])
          done()
        })
      })
    })

    describe('with chained callback', function() {
      it('should fetch values and callback', function(done) {
        cache
        .mfetch(['callback', 'chainedcallback'])
        .exec(function(err, value) {
          if (err) throw err

          values.should.include(vals[0])
          values.should.include(vals[1])
          done()
        })
      })
    })
  })
})
