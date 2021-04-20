'use strict';

const assert = require('assert');

const { getFakeStream } = require('./helpers');

const testOutput = `
TAP version 13
1..2
ok 1 bar example 1
ok 2 bar example 2

# tests 2
# pass  2
# fail  0
`;

module.exports = function (cb) {
  const fakeStream = getFakeStream();
  const oldExit = process.exit;
  const oldOut = Object.getOwnPropertyDescriptor(process, 'stdout');
  process.exit = function (code) {
    try {
      console.log(fakeStream.buff.trim());
      // console.log(require('util').inspect(fakeStream.buff.trim()))
      // console.log(require('util').inspect(testOutput.trim()))
      assert.strictEqual(code, 0);
      assert.strictEqual(fakeStream.buff.trim(), testOutput.trim());
      cb();
    } catch (e) {
      console.error(e.stack);
      oldExit(1);
    }
  };
  Object.defineProperty(process, 'stdout', { value: fakeStream });
  const test = require('../index')();
  Object.defineProperty(process, 'stdout', oldOut);
  process.exit = oldExit;

  test('bar example 1', Promise.resolve());
  test('bar example 2', Promise.resolve());

  console.log('#\n# test defaults\n#');
  test();
};

if (require.main === module) {
  module.exports(function () {});
}
