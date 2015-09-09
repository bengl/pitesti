/*
Copyright 2015, Yahoo Inc. All rights reserved.
Code licensed under the MIT License.
See LICENSE.txt
*/

'use strict'

const yaml = require('js-yaml')
const makeTap = require('make-tap-output')

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
    this.tests.push(fnOrP ? function () {
      return (
        typeof fnOrP === 'function' && typeof fnOrP.then !== 'function' ?
        Promise.resolve().then(fnOrP) :
        (typeof fnOrP.then === 'function' ? fnOrP : null)
      )
    } : null)
  }

  runTest (i) {
    if (i === this.tests.length) {
      return this.finisher(this.exitCode)
    }
    let resultObj = {
      id: i,
      name: this.testNames[i],
      pass: true
    }
    if (!this.tests[i] || (typeof this.onlyTest === 'number' && this.onlyTest !== i)) {
      resultObj.skip = true
      this.printResult(resultObj)
      return this.runTest(++i)
    }
    this.tests[i]()
    .then(
      () => this.printResult(resultObj),
      err => this.printFailResult(resultObj, err)
    )
    .then(() => this.runTest(++i))
    .catch(e => this.bailOut(e))
    // ^ Should only get here if there's an error in our code.
  }

  printFailResult (resultObj, err) {
    this.exitCode = 1
    resultObj.pass = false
    resultObj.reason = err
    this.printResult(resultObj)
  }

  skip (name) {
    this.testNames.push(name)
    this.tests.push(null)
  }

  only (name, t) {
    this.onlyTest = this.tests.length
    this.test(name, t)
  }

  printPreamble () {
    // this.out.write('TAP version 13\n')
    this.tap.plan(this.tests.length)
    // this.out.write('1..' + this.tests.length + '\n')
  }

  printResult (result) {
    this.out.write(result.pass ? 'ok' : 'not ok')
    this.out.write(' ' + (result.id + 1) + ' ' + result.name)
    if (result.skip) {
      this.out.write(' # SKIP')
    }
    this.out.write('\n')
    if (!result.pass) {
      this.logErrorDiag(result.reason)
    }
  }

  logErrorDiag (err) {
    this.out.write('  ---\n')
    this.out.write(yaml.safeDump({
      error: err && err.stack || err
    }).split('\n').map(line => '  ' + line).join('\n'))
    this.out.write('\n  ...\n')
  }

  bailOut (err) {
    this.out.write('#\n')
    this.logErrorDiag(err)
    this.out.write('#\n')
    this.out.write('Bail out! Internal pitesti error, see above.\n')
    this.finisher(2)
  }
}

module.exports = function (opts) {
  let suite = new PitestiSuite(opts)
  let test = function (name, t) {
    if (arguments.length === 0) {
      suite.printPreamble()
      suite.runTest(0)
      return
    }
    suite.test(name, t)
  }
  test.only = function (name, t) {
    suite.only(name, t)
  }
  test.skip = function (name) {
    suite.skip(name)
  }
  return test
}
