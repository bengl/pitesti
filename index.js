/*
Copyright 2015, Yahoo Inc. All rights reserved.
Code licensed under the MIT License.
See LICENSE.txt
*/

'use strict'

const yaml = require('js-yaml')

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
  }

  test (name, fnOrP) {
    this.testNames.push(name)
    if (!fnOrP) {
      this.tests.push(null)
      return
    }
    this.tests.push(function () {
      return (
      typeof fnOrP === 'function' && typeof fnOrP.then !== 'function' ?
        Promise.resolve().then(fnOrP) :
        (typeof fnOrP.then === 'function' ? fnOrP : null)
      )
    })
  }

  runTest (i) {
    if (i === this.tests.length) {
      return this.finisher(this.exitCode)
    }
    if (!this.tests[i] || (typeof this.onlyTest === 'number' && this.onlyTest !== i)) {
      this.printResult({
        id: i,
        name: this.testNames[i],
        pass: true,
        skip: true
      })
      return this.runTest(++i)
    }
    let self = this
    this.tests[i]().then(function () {
      self.printResult({
        id: i,
        name: self.testNames[i],
        pass: true
      })
    }, function (err) {
      self.exitCode = 1
      self.printResult({
        id: i,
        name: self.testNames[i],
        pass: false,
        reason: err
      })
    }).then(function () {
      self.runTest(++i)
    }).catch(function (e) {
      // Should only get here if there's an error in our code.
      self.bailOut(e)
    })
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
    this.out.write('TAP version 13\n')
    this.out.write('1..' + this.tests.length + '\n')
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
    }).split('\n').map(function (line) {
      return '  ' + line
    }).join('\n'))
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
