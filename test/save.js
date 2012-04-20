var redis = require('redis')
  , redcache = require('../')
  , cache = redcache.create({prepend: 'test:save', ttl: 100})
  , client = redis.createClient()

describe('Save', function() {
  describe('single key', function() {
    describe('with a callback', function() {
      it('should save to redis and callback', function(done) {
        cache
        .save('callback', 'testing callback', function(err) {
          client.get(cache._key('callback'), function(err, value) {
            if (err) throw err

            value.should.equal('testing callback')
            done()
          })
        })
      })
    })

    describe('without a callback', function() {
      it('should save to redis', function(done) {
        cache
        .save('nocallback', 'testing without callback')

        client.get(cache._key('nocallback'), function(err, value) {
          if (err) throw err

          value.should.equal('testing without callback')
          done()
        })
      })
    })
  })

  describe('multiple keys', function() {
    var arr = [
        { key:'multiple1'
        , value:'testing multiple1'
        }
      , { key:'multiple2'
        , value:'testing multiple2'
        }
    ]

    var keys = [cache._key('multiple1'), cache._key('multiple2')]

    var vals = [
        'testing multiple1'
      , 'testing multiple2'
    ]
    describe('with a callback', function() {
      it('should save to redis and callback', function(done) {
        cache
        .msave(arr, function(err) {
          client.mget(keys, function(err, values) {
            if (err) throw err

            values.should.include(vals[0])
            values.should.include(vals[1])
            done()
          })
        })
      })
    })

    describe('without a callback', function() {
      it('should save to redis', function(done) {
        cache
        .msave(arr)

        client.mget(keys, function(err, values) {
          if (err) throw err

          values.should.include(vals[0])
          values.should.include(vals[1])
          done()
        })
      })
    })
  })
})
