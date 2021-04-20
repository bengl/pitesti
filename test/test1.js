'use strict';

/* eslint-disable prefer-promise-reject-errors */

const { getTest } = require('./helpers');

const testOutput = `
TAP version 13
1..14
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
ok 8 foo example 8
not ok 9 foo example 9
  ---
  name: Error
  stack: fake stack

  ...
ok 10 foo example 10
ok 11 foo example 11
not ok 12 foo example 12
  ---
  name: Error
  stack: fake stack

  ...
not ok 13 foo example 13
  ---
  name: Error
  stack: fake stack

  ...
ok 14 foo example 14 # SKIP

# tests 14
# pass  6
# fail  6
# skip  2
`;

module.exports = function (cb) {
  const test = getTest({
    expected: testOutput,
    cb,
    expectedCode: 1
  });

  test('foo example 1', function () {
    return Promise.resolve();
  });
  test('foo example 2', function () {
    return Promise.reject({ stack: 'Error\nthis is a stack' });
  });
  test.skip('foo example 3', function () {
    return Promise.resolve();
  });
  test('foo example 4', Promise.resolve());
  test`foo example 5`(Promise.reject('rejected string'));
  test('foo example 6', function () {
    const err = { stack: 'Error\nthis is a stack that is thrown' };
    throw err;
  });
  test('foo example 7', function () {
    return Promise.resolve();
  });
  const err = Error();
  err.stack = 'Error\nfake stack';
  test('foo example 8', function () {});
  test('foo example 9', function () { throw err; });
  test('foo example 10', function (cb) { cb(); });
  test('foo example 11', function (cb) { setImmediate(cb); });
  test('foo example 12', function (cb) { cb(err); });
  test('foo example 13', function (cb) {
    setImmediate(function () {
      cb(err);
    });
  });
  test('foo example 14');

  console.log('#\n# test most things\n#');
  test();
};

if (require.main === module) {
  module.exports(function () {});
}
