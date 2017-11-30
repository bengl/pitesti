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
1..6
ok 1 test 1
ok 2 ctx1 : test 2
ok 3 ctx1 : test 3
ok 4 ctx2 : test 4
ok 5 ctx2 : ctx3 : test 5
ok 6 test 6

`

module.exports = function (cb) {
  let test = require('../index')({
    outputStream: fakeStream,
    summary: false,
    contextSeparator: ' : ',
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

  test('test 1', () => {})
  test.context('ctx1', () => {
    test('test 2', () => {})
    test`test 3`(() => {})
  })
  test.context`ctx2`(() => {
    test('test 4', () => {})
    test.context`ctx3`(() => {
      test('test 5', () => {})
    })
  })
  test('test 6', () => {})

  test()
}

if (require.main === module) {
  module.exports(function () {})
}
