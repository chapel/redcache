var redis = require('redis')
  , redcache = require('../')
  , cache = redcache.create({prepend: 'test:get', ttl: 100})
  , client = redis.createClient()
  , vals = ['testing callback', 'testing chained callback']

describe('Get', function() {
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

  after(function(done) {
    client.del([cache._key('callback'), cache._key('chainedcallback')], done)
  })

  describe('single key', function() {
    describe('no miss function', function() {
      it('should fetch value and callback', function(done) {
        cache
        .get('callback', function(err, value) {
          debugger;
          if (err) throw err

          value.should.equal(vals[0])
          done()
        })
      })

      it('should fetch value and chained callback', function(done) {
        cache
        .get('callback')
        .run(function(err, value) {
          if (err) throw err

          value.should.equal(vals[0])
          done()
        })
      })
    })

    describe('miss function', function() {
      it('should fetch value and callback', function(done) {
        cache
        .get('callback', function(done) {
          done(null, ['callback', vals[0]], vals[0])
        }, function(err, value) {
          if (err) throw err

          value.should.equal(vals[0])
          done()
        })
      })

      it('should fetch value and chained callback', function(done) {
        cache
        .get('callback')
        .miss(function(done) {
          done(null, ['callback', vals[0]], vals[0])
        })
        .run(function(err, value) {
          if (err) throw err

          value.should.equal(vals[0])
          done()
        })
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
