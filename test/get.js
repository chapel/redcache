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
      it('should return value using inline callback', function(done) {
        cache
        .get('key1', function(err, value) {
          should.not.exist(err)

          value.should.equal(vals[0])
          done()
        })
      })

      it('should return value using chained callback', function(done) {
        cache
        .get('key1')
        .run(function(err, value) {
          should.not.exist(err)

          value.should.equal(vals[0])
          done()
        })
      })

      it('should\'t return value using inline callback', function(done) {
        cache
        .get('key3', function(err, value) {
          should.not.exist(err)

          should.not.exist(value)
          done()
        })
      })

      it('should\'t return value using chained callback', function(done) {
        cache
        .get('key3')
        .run(function(err, value) {
          should.not.exist(err)

          should.not.exist(value)
          done()
        })
      })
    })

    describe('with miss fn', function() {
      it('should return value using inline callback', function(done) {
        cache
        .get('key1', function(add, done) {
          done('Should not miss')
        }, function(err, value) {
          should.not.exist(err)

          value.should.equal(vals[0])
          done()
        })
      })

      it('should return value using chained callback', function(done) {
        cache
        .get('key1')
        .miss(function(add, done) {
          done('Should not miss')
        })
        .run(function(err, value) {
          should.not.exist(err)

          value.should.equal(vals[0])
          done()
        })
      })

      it('should return value using inline miss then callback', function(done) {
        cache
        .get('key3', function(add, done) {
          add('key3', 'value3')
          done(null)
        }, function(err, value) {
          should.not.exist(err)

          value.should.equal('value3')
          done()
        })
      })

      it('should return value using chained miss then call chained callback', function(done) {
        cache
        .get('key4')
        .miss(function(add, done) {
          add('key4', 'value4')
          done(null)
        })
        .run(function(err, value) {
          should.not.exist(err)

          value.should.equal('value4')
          done()
        })
      })

      it('should return error using inline miss then callback', function(done) {
        cache
        .get('key3', function(add, done) {
          done('Problem getting value')
        }, function(err, value) {
          should.exist(err)

          done()
        })
      })

      it('should return error using chained miss then call chained callback', function(done) {
        cache
        .get('key4')
        .miss(function(add, done) {
          done('Problem getting value')
        })
        .run(function(err, value) {
          should.exist(err)

          done()
        })
      })
    })
  })

  describe('multiple keys', function() {
    describe('without miss fn', function() {
      it('should return values using inline callback', function(done) {
        cache
        .get(['key1', 'key2'], function(err, values) {
          should.not.exist(err)

          values[0].should.equal(vals[0])
          values[1].should.equal(vals[1])
          done()
        })
      })

      it('should return values using chained callback', function(done) {
        cache
        .get(['key1', 'key2'])
        .run(function(err, values) {
          should.not.exist(err)

          values[0].should.equal(vals[0])
          values[1].should.equal(vals[1])
          done()
        })
      })

      it('should\'t return values using inline callback', function(done) {
        cache
        .get(['key3', 'key4'], function(err, values) {
          should.not.exist(err)

          should.not.exist(values)
          done()
        })
      })

      it('should\'t return values using chained callback', function(done) {
        cache
        .get(['key3', 'key4'])
        .run(function(err, values) {
          should.not.exist(err)

          should.not.exist(values)
          done()
        })
      })
    })

    describe('with miss fn', function() {
      it('should return values using inline callback', function(done) {
        cache
        .get(['key1', 'key2'], function(add, done) {
          done('Should not miss')
        }, function(err, values) {
          should.not.exist(err)

          values[0].should.equal(vals[0])
          values[1].should.equal(vals[1])
          done()
        })
      })

      it('should return values using chained callback', function(done) {
        cache
        .get(['key1', 'key2'])
        .miss(function(add, done) {
          done('Should not miss')
        })
        .run(function(err, values) {
          should.not.exist(err)

          values[0].should.equal(vals[0])
          values[1].should.equal(vals[1])
          done()
        })
      })

      it('should return values using inline miss then callback', function(done) {
        cache
        .get(['key3', 'key4'], function(add, done) {
          add('key3', 'value3')
          add('key4', 'value4')
          done(null)
        }, function(err, values) {
          should.not.exist(err)

          console.log(values)
          values[0].should.equal('value3')
          values[1].should.equal('value4')
          done()
        })
      })

      it('should return value using chained miss then call chained callback', function(done) {
        cache
        .get(['key3', 'key4'])
        .miss(function(add, done) {
          add('key3', 'value3')
          add('key4', 'value4')
          done(null)
        })
        .run(function(err, values) {
          should.not.exist(err)

          values[0].should.equal('value3')
          values[1].should.equal('value4')
          done()
        })
      })

      it('should return error using inline miss then callback', function(done) {
        cache
        .get(['key3', 'key4'], function(add, done) {
          done('Problem getting values')
        }, function(err, values) {
          console.log(err)
          should.exist(err)

          done()
        })
      })

      it('should return error using chained miss then call chained callback', function(done) {
        cache
        .get(['key3', 'key4'])
        .miss(function(add, done) {
          done('Problem getting values')
        })
        .run(function(err, values) {
          console.log(err)
          should.exist(err)

          done()
        })
      })
    })
  })
})
