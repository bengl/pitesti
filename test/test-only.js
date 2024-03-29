'use strict';

const { getTest } = require('./helpers');

const testOutput = `
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
`;

const test = getTest({
  expected: testOutput
});

test.skip`bar example 1`(Promise.resolve());
test('bar example 2', Promise.resolve());
test.only('bar example 3', Promise.resolve());
test.only`bar example 4`(Promise.resolve());
test('bar example 5', Promise.resolve());

test();
