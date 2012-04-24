var redis      = require('redis')
  , redcache   = require('../')
  , should     = require('should')
  , cache      = redcache.create({prepend: 'test:get', ttl: 100})
  , client     = redis.createClient()
  , vals       = [
      'value1'
    , 'value2'
    ]

describe('cache.get()', function() {
  beforeEach(function(done) {
    client.multi()
    .setex(
        cache._key('key1')
      , 100
      , vals[0]
    )
    .setex(
        cache._key('key2')
      , 100
      , vals[1]
    )
    .exec(done)
  })

  afterEach(function(done) {
    client.del([
        cache._key('key1')
      , cache._key('key2')
      , cache._key('key3')
      , cache._key('key4')
    ], done)
  })

  describe('single key', function() {
    describe('without miss fn', function() {
      describe('using inline callback', function() {
        it('should return value', function(done) {
          cache
          .get('key1', function(err, value) {
            should.not.exist(err)

            value.should.equal(vals[0])
            done()
          })
        })
      
        it('should\'t return value', function(done) {
          cache
          .get('key3', function(err, value) {
            should.not.exist(err)

            should.not.exist(value)
            done()
          })
        })
      })

      describe('using chained callback', function() {
        it('should return value', function(done) {
          cache
          .get('key1')
          .run(function(err, value) {
            should.not.exist(err)

            value.should.equal(vals[0])
            done()
          })
        })


        it('should\'t return value', function(done) {
          cache
          .get('key3')
          .run(function(err, value) {
            should.not.exist(err)

            should.not.exist(value)
            done()
          })
        })
      })
    })

    describe('with miss fn', function() {
      describe('using inline callback', function() {
        it('should return value', function(done) {
          cache
          .get('key1', function(missed, done) {
            done('Should not miss')
          }, function(err, value) {
            should.not.exist(err)

            value.should.equal(vals[0])
            done()
          })
        })

        it('should return value from miss', function(done) {
          cache
          .get('key3', function(missed, done) {
            missed.save('value3')
            done(null)
          }, function(err, value) {
            should.not.exist(err)

            value.should.equal('value3')
            done()
          })
        })

        it('should return error from miss', function(done) {
          cache
          .get('key3', function(missed, done) {
            done('Problem getting value')
          }, function(err, value) {
            should.exist(err)

            done()
          })
        })
      })

      describe('using chained callback', function() {
        it('should return value', function(done) {
          cache
          .get('key1')
          .miss(function(missed, done) {
            done('Should not miss')
          })
          .run(function(err, value) {
            should.not.exist(err)

            value.should.equal(vals[0])
            done()
          })
        })


        it('should return value from miss', function(done) {
          cache
          .get('key4')
          .miss(function(missed, done) {
            missed.save('value4')
            done(null)
          })
          .run(function(err, value) {
            should.not.exist(err)

            value.should.equal('value4')
            done()
          })
        })

        it('should return error from miss', function(done) {
          cache
          .get('key4')
          .miss(function(missed, done) {
            done('Problem getting value')
          })
          .run(function(err, value) {
            should.exist(err)

            done()
          })
        })
      })
    })
  })

  describe('multiple keys', function() {
    describe('without miss fn', function() {
      describe('using inline callback', function() {
        it('should return values', function(done) {
          cache
          .get(['key1', 'key2'], function(err, values) {
            should.not.exist(err)

            values[0].should.equal(vals[0])
            values[1].should.equal(vals[1])
            done()
          })
        })

        it('should\'t return values', function(done) {
          cache
          .get(['key3', 'key4'], function(err, values) {
            should.not.exist(err)

            should.not.exist(values)
            done()
          })
        })
      })

      describe('using chained callback', function() {
        it('should return values', function(done) {
          cache
          .get(['key1', 'key2'])
          .run(function(err, values) {
            should.not.exist(err)

            values[0].should.equal(vals[0])
            values[1].should.equal(vals[1])
            done()
          })
        })

        it('should\'t return values', function(done) {
          cache
          .get(['key3', 'key4'])
          .run(function(err, values) {
            should.not.exist(err)

            should.not.exist(values)
            done()
          })
        })
      })
    })

    describe('with miss fn', function() {
      describe('using inline callback', function() {
        it('should return values', function(done) {
          cache
          .get(['key1', 'key2'], function(missed, done) {
            done('Should not miss')
          }, function(err, values) {
            should.not.exist(err)

            values[0].should.equal(vals[0])
            values[1].should.equal(vals[1])
            done()
          })
        })

        it('should return values from miss', function(done) {
          cache
          .get(['key3', 'key4'], function(missed, done) {
            missed[0].save('value3')
            missed[1].save('value4')
            done(null)
          }, function(err, values) {
            should.not.exist(err)

            values[0].should.equal('value3')
            values[1].should.equal('value4')
            done()
          })
        })

        it('should return error from miss', function(done) {
          cache
          .get(['key3', 'key4'], function(missed, done) {
            done('Problem getting values')
          }, function(err, values) {
            should.exist(err)

            done()
          })
        })
      })

      describe('using chained callback', function() {
        it('should return values', function(done) {
          cache
          .get(['key1', 'key2'])
          .miss(function(missed, done) {
            done('Should not miss')
          })
          .run(function(err, values) {
            should.not.exist(err)

            values[0].should.equal(vals[0])
            values[1].should.equal(vals[1])
            done()
          })
        })

        it('should return value from miss', function(done) {
          cache
          .get(['key3', 'key4'])
          .miss(function(missed, done) {
            missed[0].save('value3')
            missed[1].save('value4')
            done(null)
          })
          .run(function(err, values) {
            should.not.exist(err)

            values[0].should.equal('value3')
            values[1].should.equal('value4')
            done()
          })
        })

        it('should return error from miss', function(done) {
          cache
          .get(['key3', 'key4'])
          .miss(function(missed, done) {
            done('Problem getting values')
          })
          .run(function(err, values) {
            should.exist(err)

            done()
          })
        })
      })
    })
  })
})
