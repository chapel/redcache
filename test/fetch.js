var redis = require('redis')
  , redcache = require('../')
  , should = require('should')
  , cache = redcache.create({prepend: 'test:fetch', ttl: 100})
  , client = redis.createClient()
  , vals = ['testing callback', 'testing chained callback']

describe('cache.fetch()', function() {
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
    it('should return value', function(done) {
      cache
      .fetch('callback', function(err, value) {
        if (err) throw err

        value.should.equal(vals[0])
        done()
      })
    })

    it('shouldn\'t return value', function(done) {
      cache
      .fetch('callback1', function(err, value) {
        if (err) throw err

        should.not.exist(value)
        done()
      })
    })
  })

  describe('multiple keys', function() {
    it('should return all values', function(done) {
      cache
      .mfetch(['callback', 'chainedcallback'], function(err, values) {
        if (err) throw err

        values[0].should.equal(vals[0])
        values[1].should.equal(vals[1])
        done()
      })
    })

    it('should return one value', function(done) {
      cache
      .mfetch(['callback1', 'chainedcallback'], function(err, values) {
        if (err) throw err

        should.not.exist(values[0])
        values[1].should.equal(vals[1])
        done()
      })
    })

    it('shouldn\'t return any values', function(done) {
      cache
      .fetch(['callback1', 'callback2'], function(err, values) {
        if (err) throw err

        should.not.exist(values)
        done()
      })
    })
  })
})
