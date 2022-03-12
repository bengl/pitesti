'use strict';

const { getTest } = require('./helpers');

const testOutput = `
TAP version 13
1..3
ok 1 good time
ok 2 good time on own time
not ok 3 bad time
  ---
  name: Error
  message: Test timed out (50ms)
  stack: fake stack

  ...
`;

Error.prepareStackTrace = () => 'Error\nfake stack';

const test = getTest({
  expected: testOutput,
  config: { summary: false, timeout: 50 },
  expectedCode: 1
});

test('good time', function (cb) {
  setTimeout(cb, 25);
});

test('good time on own time', function (cb) {
  setTimeout(cb, 50);
}, { timeout: 100 });

test('bad time', function (cb) {
  setTimeout(cb, 75);
});

test();
