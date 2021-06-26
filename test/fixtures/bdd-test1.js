'use strict';

const assert = require('assert');
const {
  before, beforeAll, beforeEach,
  after, afterAll, afterEach,
  describe, context, it
} = require('../../bdd');

const expectedStack = [
  -1,
  -2,
  -3,
  -4,
  -5,
  -6,
  -7,
  -8,
  'before0',
  'beforeAll0',
  'describe1before1',
  'describe1beforeAll1',
  'describe1before2',
  'describe1beforeAll2',
  'describe1ctx1before1',
  'describe1ctx1before2',
  'describe1beforeEach1',
  'describe1beforeEach2',
  'describe1beforeEach3',
  'describe1beforeEach4',
  'describe1ctx1beforeEach1',
  'describe1ctx1beforeEach2',
  'describe1ctx1test1',
  'describe1ctx1afterEach1',
  'describe1ctx1afterEach2',
  'describe1afterEach1',
  'describe1afterEach2',
  'describe1afterEach3',
  'describe1afterEach4',
  'describe1ctx1after1',
  'describe1ctx1after2',
  'describe1beforeEach1',
  'describe1beforeEach2',
  'describe1beforeEach3',
  'describe1beforeEach4',
  'describe1ctx2test1',
  'describe1afterEach1',
  'describe1afterEach2',
  'describe1afterEach3',
  'describe1afterEach4',
  'describe1after1',
  'describe1afterAll1',
  'describe1after2',
  'describe1afterAll2',
  'describe2ctx1test1',
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
after(() => pushStack('after0'));
afterAll(() => {
  pushStack('afterAll0');
  assert.deepStrictEqual(expectedStack.length, stack.length);
});
describe('describe1', () => {
  pushStack(-2);
  before(() => pushStack('describe1before1'));
  beforeAll(() => pushStack('describe1beforeAll1'));
  beforeEach(() => pushStack('describe1beforeEach1'));
  beforeEach(() => pushStack('describe1beforeEach2'));
  after(() => pushStack('describe1after1'));
  afterAll(() => pushStack('describe1afterAll1'));
  afterEach(() => pushStack('describe1afterEach1'));
  afterEach(() => pushStack('describe1afterEach2'));

  context('ctx1', () => {
    pushStack(-3);
    before(() => pushStack('describe1ctx1before1'));
    beforeEach(() => pushStack('describe1ctx1beforeEach1'));
    after(() => pushStack('describe1ctx1after1'));
    afterEach(() => pushStack('describe1ctx1afterEach1'));
    it('test1', () => pushStack('describe1ctx1test1'));
    before(() => pushStack('describe1ctx1before2'));
    beforeEach(() => pushStack('describe1ctx1beforeEach2'));
    after(() => pushStack('describe1ctx1after2'));
    afterEach(() => pushStack('describe1ctx1afterEach2'));
  });
  describe('ctx2', () => {
    pushStack(-4);
    it('test1', () => pushStack('describe1ctx2test1'));
  });

  before(() => pushStack('describe1before2'));
  beforeAll(() => pushStack('describe1beforeAll2'));
  beforeEach(() => pushStack('describe1beforeEach3'));
  beforeEach(() => pushStack('describe1beforeEach4'));
  after(() => pushStack('describe1after2'));
  afterAll(() => pushStack('describe1afterAll2'));
  afterEach(() => pushStack('describe1afterEach3'));
  afterEach(() => pushStack('describe1afterEach4'));
});
pushStack(-5);
describe('describe2', () => {
  pushStack(-6);
  context('ctx1', () => {
    pushStack(-7);
    it('test1', () => pushStack('describe2ctx1test1'));
  });
  it.skip('test1', () => pushStack('describe2test1'));
});
describe.skip('describe3', () => {
  pushStack(-8);
  it('test1', () => pushStack('describe3test1'));
});
