'use strict'

const assert = require('assert')

let fakeStream = new (require('stream').Writable)()

fakeStream.buff = ''
fakeStream._write = function (chunk, enc, next) {
  this.buff += chunk.toString()
  next()
}

let testOutput = `
TAP version 13
1..1
ok 1 outer test
`

module.exports = function (cb) {
  let test = require('../index')({
    outputStream: fakeStream,
    done: function (code) {
      try {
        console.log(fakeStream.buff.trim())
        // console.log(require('util').inspect(fakeStream.buff.trim()))
        // console.log(require('util').inspect(testOutput.trim()))
        assert.equal(code, 0)
        assert.equal(fakeStream.buff.trim(), testOutput.trim())
        cb()
      } catch (e) {
        console.error(e.stack)
        process.exit(1)
      }
    }
  })

  test('outer test', function () {
    test('inner test 1, which is ignored', Promise.reject())
    return Promise.resolve().then(function () {
      test('inner test 2, which is ignored', Promise.reject())
      return true
    })
  })

  test()
}
