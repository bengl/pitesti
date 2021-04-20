'use strict';

/* eslint-disable prefer-promise-reject-errors */

const { getTest } = require('./helpers');

const testOutput = `
TAP version 13
1..1
ok 1 outer test
`;

module.exports = function (cb) {
  const test = getTest({
    expected: testOutput,
    cb,
    config: { summary: false }
  });

  test('outer test', function () {
    test('inner test 1, which is ignored', () => Promise.reject());
    return Promise.resolve().then(function () {
      test('inner test 2, which is ignored', () => Promise.reject());
      return true;
    });
  });

  test();
};

if (require.main === module) {
  module.exports(function () {});
}
