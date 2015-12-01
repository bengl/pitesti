/*
Copyright 2015, Yahoo Inc. All rights reserved.
Code licensed under the MIT License.
See LICENSE.txt
*/

'use strict'

const makeTap = require('make-tap-output')

const isFunc = f => typeof f === 'function'
const isNum = n => typeof n === 'number'
const isPromise = p => isFunc(p.then)
const promisify = f => Promise.resolve().then(f)

class PitestiSuite {
  constructor (opts) {
    opts = opts || {}
    this.tests = []
    this.testNames = []
    this.skips = {}
    this.onlyTest = null
    this.exitCode = 0
    this.finisher = opts.done || process.exit
    this.out = opts.outputStream || process.stdout
    this.tap = makeTap()
    this.tap.pipe(this.out)
  }

  test (name, fnOrP) {
    this.testNames.push(name)
    this.tests.push(fnOrP ? () =>
      isPromise(fnOrP) ? fnOrP : (isFunc(fnOrP) ? promisify(fnOrP) : null)
    : null)
  }

  runTest (i) {
    if (i === this.tests.length) {
      return this.finisher(this.exitCode)
    }
    const name = this.testNames[i]
    if (!this.tests[i] || (isNum(this.onlyTest) && this.onlyTest !== i)) {
      this.tap.pass(name, 'SKIP')
      return this.runTest(++i)
    }
    this.tests[i]()
    .then(
      () => this.tap.pass(name),
      err => {
        this.exitCode = 1
        this.tap.fail(name, typeof err === 'string' ? {message: err} : err)
      }
    )
    .then(() => this.runTest(++i))
    .catch(e => this.bailOut(e))
    // ^ Should only get here if there's an error in our code.
  }

  skip (name) {
    this.testNames.push(name)
    this.tests.push(null)
  }

  only (name, t) {
    this.onlyTest = this.tests.length
    this.test(name, t)
  }

  plan () {
    this.tap.plan(this.tests.length)
  }

  bailOut (err) {
    this.out.write(err.stack)
    this.out.write('\n\nBail out! Internal pitesti error, see above.\n')
    this.finisher(2)
  }
}

function templateWrap (func) {
  let orig = PitestiSuite.prototype[func]
  PitestiSuite.prototype[func] = function () {
    if (Array.isArray(arguments[0])) {
      return (fn) => orig.call(
        this,
        String.raw(arguments[0], Array.prototype.slice.call(arguments, 1)),
        fn
      )
    } else {
      return orig.apply(this, arguments)
    }
  }
}

templateWrap('test')
templateWrap('only')
templateWrap('skip')

module.exports = function (opts) {
  let testStarted = false
  const suite = new PitestiSuite(opts)
  const test = function () {
    if (testStarted) {
      return
    }
    if (arguments.length === 0) {
      testStarted = true
      suite.plan()
      suite.runTest(0)
      return
    }
    return suite.test.apply(suite, arguments)
  }
  test.only = function () { return suite.only.apply(suite, arguments) }
  test.skip = function () { return suite.skip.apply(suite, arguments) }
  return test
}
