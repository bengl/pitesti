'use strict';

const { getTest } = require('./helpers');

const testOutput = `
TAP version 13
1..10
ok 1 test 1
ok 2 ctx1 : test 2
ok 3 ctx1 : test 3
ok 4 ctx2 : test 4
ok 5 ctx2 : ctx3 : test 5
ok 6 ctx4 : test 6
ok 7 ctx4 : ctx5 : test 7 # SKIP
ok 8 ctx6 : test 8 # SKIP
ok 9 ctx6 : ctx7 : test 9 # SKIP
ok 10 test 10

`;

const { test, context } = getTest({
  expected: testOutput,
  config: { summary: false, contextSeparator: ' : ' }
});

test('test 1', () => {});
context('ctx1', () => {
  test('test 2', () => {});
  test`test 3`(() => {});
});
context`ctx2`(() => {
  test('test 4', () => {});
  context`ctx3`(() => {
    test('test 5', () => {});
  });
});
context`ctx4`(() => {
  test('test 6', () => {});
  context.skip`ctx5`(() => {
    test('test 7', () => {});
  });
});
context.skip('ctx6', () => {
  test('test 8', () => {});
  context`ctx7`(() => {
    test('test 9', () => {});
  });
});

test('test 10', () => {});

test();
