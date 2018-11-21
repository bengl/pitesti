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
1..3
ok 1 good time
ok 2 good time on own time
not ok 3 bad time
  ---
  name: Error
  message: Test timed out (50ms)
  stack: fake stack

  ...
`

module.exports = function (cb) {
  const oldPrepare = Error.prepareStackTrace
  Error.prepareStackTrace = () => 'Error\nfake stack'
  let test = require('../index')({
    timeout: 50,
    outputStream: fakeStream,
    summary: false,
    done: function (code) {
      try {
        console.log(fakeStream.buff.trim())
        // console.log(require('util').inspect(fakeStream.buff.trim()))
        // console.log(require('util').inspect(testOutput.trim()))
        assert.equal(code, 1)
        assert.equal(fakeStream.buff.trim(), testOutput.trim())
        Error.prepareStackTrace = oldPrepare
        cb()
      } catch (e) {
        console.error(e.stack)
        process.exit(1)
      }
    }
  })

  test('good time', function (cb) {
    setTimeout(cb, 25)
  })

  test('good time on own time', function (cb) {
    setTimeout(cb, 50)
  }, { timeout: 100 })

  test('bad time', function (cb) {
    setTimeout(cb, 75)
  })

  test()
}

if (require.main === module) {
  module.exports(function () {})
}
