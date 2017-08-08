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
1..5
ok 1 bar example 1 # SKIP
ok 2 bar example 2 # SKIP
ok 3 bar example 3 # SKIP
ok 4 bar example 4
ok 5 bar example 5 # SKIP

# tests 5
# pass  1
# fail  0
# skip  4
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

  test.skip`bar example 1`(Promise.resolve())
  test('bar example 2', Promise.resolve())
  test.only('bar example 3', Promise.resolve())
  test.only`bar example 4`(Promise.resolve())
  test('bar example 5', Promise.resolve())

  console.log('#\n# test `only`\n#')
  test()
}

if (require.main === module) {
  module.exports(function () {})
}
