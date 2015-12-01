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
1..8
ok 1 foo example 1
not ok 2 foo example 2
  ---
  stack: this is a stack

  ...
ok 3 foo example 3 # SKIP
ok 4 foo example 4
not ok 5 foo example 5
  ---
  message: rejected string

  ...
not ok 6 foo example 6
  ---
  stack: this is a stack that is thrown

  ...
ok 7 foo example 7
ok 8 foo example 8 # SKIP

# tests 8
# pass  3
# fail  3
# skip  2
`

module.exports = function (cb) {
  let test = require('../index')({
    outputStream: fakeStream,
    done: function (code) {
      try {
        console.log(fakeStream.buff.trim())
        // console.log(require('util').inspect(fakeStream.buff.trim()))
        // console.log(require('util').inspect(testOutput.trim()))
        assert.equal(code, 1)
        assert.equal(fakeStream.buff.trim(), testOutput.trim())
        cb()
      } catch (e) {
        console.error(e.stack)
        process.exit(1)
      }
    }
  })

  test('foo example 1', function () {
    return Promise.resolve()
  })
  test('foo example 2', function () {
    return Promise.reject({stack: 'this is a stack'})
  })
  test.skip('foo example 3', function () {
    return Promise.resolve()
  })
  test('foo example 4', Promise.resolve())
  test `foo example 5`(Promise.reject('rejected string'))
  test('foo example 6', function () {
    let err = {stack: 'this is a stack that is thrown'}
    throw err
  })
  test('foo example 7', function () {
    return Promise.resolve()
  })
  test('foo example 8')

  console.log('#\n# test most things\n#')
  test()
}
