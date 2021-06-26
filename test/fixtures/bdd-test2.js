'use strict';

/* eslint-disable */

const assert = require('assert');
const {
  before, beforeAll, beforeEach,
  after, afterAll, afterEach,
  describe, context, it
} = require('../../bdd');

const expectedStack = [
  -1,
  'before0',
  'beforeAll0',
  'describe1before',
  'beforeEach0',
  'describe1beforeEach',
  'describe1ctx2test1',
  'describe1afterEach',
  'beforeEach0',
  'describe3test1',
  'after0',
  'afterAll0'
];

const stack = [];
function pushStack (n) {
  stack.push(n);
}
pushStack(-1);
before(() => pushStack('before0'));
beforeAll(() => pushStack('beforeAll0'));
beforeEach(() => pushStack('beforeEach0'));
after(() => pushStack('after0'));
afterAll(() => {
  pushStack('afterAll0');
  assert.deepStrictEqual(expectedStack, stack);
});
describe('describe1', () => {
  before(() => pushStack('describe1before'));
  beforeEach(() => pushStack('describe1beforeEach'));
  afterEach(() => pushStack('describe1afterEach'));
  context('ctx1', () => {
    it('test1', () => pushStack('describe1ctx1test1'));
  });
  describe('ctx2', () => {
    it.only('test1', () => pushStack('describe1ctx2test1'));
  });
});
describe('describe2', () => {
  before(() => pushStack('describe2before'));
  beforeEach(() => pushStack('describe2beforeEach'));
  afterEach(() => pushStack('describe2afterEach'));
  context('ctx1', () => {
    it('test1', () => pushStack('describe2ctx1test1'));
  });
  it('test1', () => pushStack('describe2test1'));
});
describe.only('describe3', () => {
  it('test1', () => pushStack('describe3test1'));
});
