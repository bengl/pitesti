'use strict';

const { getTest } = require('./helpers');

const testOutput = `
TAP version 13
1..10
ok 1 main test 1
# Subtest: sub test 1
    ok 1 sub test 1 1
    ok 2 sub test 1 2
ok 2 main test 2
ok 3 main test 3
# Subtest: sub test 2
    ok 1 sub test 2 1
    ok 2 sub test 2 2
    # Subtest: sub sub test 1
        ok 1 sub sub test 1 1
        ok 2 sub sub test 1 2
ok 4 main test 4

# tests 10
# pass  10
# fail  0
`;

module.exports = function (cb) {
  const test = getTest({
    expected: testOutput,
    cb,
    config: { summary: true }
  });

  test('main test 1', () => {});
  test.subtest('sub test 1', () => {
    test('sub test 1 1', () => {});
    test('sub test 1 2', () => {});
  });
  test('main test 2', () => {});
  test('main test 3', () => {});
  test.subtest('sub test 2', () => {
    test('sub test 2 1', () => {});
    test('sub test 2 2', () => {});
    test.subtest('sub sub test 1', () => {
      test('sub sub test 1 1', () => {});
      test('sub sub test 1 2', () => {});
    });
  });
  test('main test 4', () => {});

  test();
};

if (require.main === module) {
  module.exports(function () {});
}
