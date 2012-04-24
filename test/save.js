var redis = require('redis')
  , redcache = require('../')
  , cache = redcache.create({prepend: 'test:save', ttl: 100})
  , client = redis.createClient()

describe('cache.save()', function() {
  afterEach(function(done) {
    client.del([
        cache._key('key1')
      , cache._key('key2')
      , cache._key('multiple1')
      , cache._key('multiple2')
      , cache._key('multiple3')
      , cache._key('multiple4')
    ], done)
  })

  describe('single key', function() {
    describe('with callback', function() {
      it('should save value to redis', function(done) {
        cache
        .save({key: 'key1', value: 'value1'}, function(err) {
          client.get(cache._key('key1'), function(err, value) {
            if (err) throw err

            value.should.equal('value1')
            done()
          })
        })
      })
    })

    describe('without a callback', function() {
      it('should save value to redis', function(done) {
        cache
        .save({key: 'key2', value: 'value2'})

        client.get(cache._key('key2'), function(err, value) {
          if (err) throw err

          value.should.equal('value2')
          done()
        })
      })
    })
  })

  describe('multiple keys', function() {
    var arr = [
        {
            key:'multiple1'
          , value:'multi-value1'
        }
      , {
            key:'multiple2'
          , value:'multi-value2'
        }
      , {
            key:'multiple3'
          , value:'multi-value3'
        }
      , {
            key:'multiple4'
          , value:'multi-value4'
        }

    ]

    var keys1 = [cache._key('multiple1'), cache._key('multiple2')]
      , keys2 = [cache._key('multiple3'), cache._key('multiple4')]

    describe('with a callback', function() {
      it('should save value to redis', function(done) {
        cache
        .msave(arr.slice(0, 2), function(err) {
          client.mget(keys1, function(err, values) {
            if (err) throw err

            values.should.include(arr[0].value)
            values.should.include(arr[1].value)
            done()
          })
        })
      })
    })

    describe('without a callback', function() {
      it('should save value to redis', function(done) {
        cache
        .msave(arr.slice(2, 4))

        client.mget(keys2, function(err, values) {
          if (err) throw err

          values.should.include(arr[2].value)
          values.should.include(arr[3].value)
          done()
        })
      })
    })
  })
})
