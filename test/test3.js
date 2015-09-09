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
1..2
ok 1 bar example 1
ok 2 bar example 2
`

module.exports = function (cb) {
  let oldExit = process.exit
  let oldOut = Object.getOwnPropertyDescriptor(process, 'stdout')
  process.exit = function (code) {
    try {
      console.log(fakeStream.buff.trim())
      // console.log(require('util').inspect(fakeStream.buff.trim()))
      // console.log(require('util').inspect(testOutput.trim()))
      assert.equal(code, 0)
      assert.equal(fakeStream.buff.trim(), testOutput.trim())
      cb()
    } catch (e) {
      console.error(e.stack)
      oldExit(1)
    }
  }
  Object.defineProperty(process, 'stdout', {value: fakeStream})
  let test = require('../index')()
  Object.defineProperty(process, 'stdout', oldOut)
  process.exit = oldExit

  test('bar example 1', Promise.resolve())
  test('bar example 2', Promise.resolve())

  console.log('#\n# test defaults\n#')
  test()
}
