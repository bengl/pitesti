'use strict';

const pitesti = require('./index');

let atLeastOneOnly = false;

class TestBlock {
  constructor (desc, skip, only, opts, parent) {
    this.desc = desc;
    this.skip = skip;
    this.only = only;
    this.opts = opts;
    this.parent = parent;
    this.children = [];
    if (only) {
      atLeastOneOnly = true;
    }
  }

  isSkipped () {
    return this.skip ||
      (this.parent && this.parent.isSkipped());
  }

  isOnly () {
    return this.only || this._isOnlyDownward() || this._isOnlyUpward();
  }

  _isOnlyUpward () {
    return this.parent && (this.parent.only || this.parent._isOnlyUpward());
  }

  _isOnlyDownward () {
    return this.children.some(child => child.only || child._isOnlyDownward());
  }
}

class Ctx extends TestBlock {
  constructor (desc, skip, only, opts, parent) {
    super(desc, skip, only, opts, parent);
    this.beforeEach = [];
    this.afterEach = [];
    this.before = [];
    this.after = [];
  }

  newCtx (desc, fn, skip, only, opts) {
    const ctx = new Ctx(desc, skip, only, opts, this);
    this.children.push(ctx);
    currentCtx = ctx;
    fn();
    currentCtx = this;
  }

  newTest (desc, fn, skip, only, opts) {
    this.children.push(new Test(desc, fn, skip, only, opts, this));
  }
}

class Test extends TestBlock {
  constructor (desc, fn, skip, only, opts, parent) {
    super(desc, skip, only, opts, parent);
    this.fn = fn;
  }
}

let test;
let currentCtx = new Ctx();

function describe (desc, fn, opts) {
  currentCtx.newCtx(desc, fn, false, false, opts);
}

describe.only = (desc, fn, opts) => {
  currentCtx.newCtx(desc, fn, false, true, opts);
};

describe.skip = (desc, fn, opts) => {
  currentCtx.newCtx(desc, fn, true, false, opts);
};

function beforeEach (fn, opts) {
  fn.opts = opts;
  fn.ctx = currentCtx;
  currentCtx.beforeEach.push(fn);
}

function afterEach (fn, opts) {
  fn.opts = opts;
  fn.ctx = currentCtx;
  currentCtx.afterEach.push(fn);
}

function before (fn, opts) {
  fn.opts = opts;
  currentCtx.before.push(fn);
}

function after (fn, opts) {
  fn.opts = opts;
  currentCtx.after.push(fn);
}

function it (desc, fn, opts) {
  currentCtx.newTest(desc, fn, false, false, opts);
}

it.only = (desc, fn, opts) => {
  currentCtx.newTest(desc, fn, false, true, opts);
};

it.skip = (desc, fn, opts) => {
  currentCtx.newTest(desc, fn, true, false, opts);
};

function processCtx (ctx, stack = []) {
  const {
    before,
    after,
    children,
    desc,
    opts
  } = ctx;

  const testFn = getTestFunction(ctx);
  const doTests = () => {
    before.forEach((fn) => {
      testFn('[before]', fn, fn.opts);
    });
    const childStack = [...stack, ctx];
    children.forEach(child => {
      if (child instanceof Ctx) {
        processCtx(child, childStack);
      } else {
        processTest(child, childStack);
      }
    });
    after.forEach((fn) => {
      testFn('[after]', fn, fn.opts);
    });
  };
  if (desc) {
    test.context(desc, doTests, opts);
  } else {
    doTests();
  }
}

function getTestFunction (testBlock) {
  return testBlock.isSkipped() ||
    (atLeastOneOnly && !testBlock.isOnly())
    ? test.skip : test;
}

function processTest (testCase, stack) {
  const {
    desc,
    fn,
    opts
  } = testCase;
  const testFn = getTestFunction(testCase);
  stack.forEach(ctx => {
    ctx.beforeEach.forEach(fn => {
      testFn(`${desc} [beforeEach]`, fn, fn.opts);
    });
  });
  testFn(desc, fn, opts);
  stack.reverse().forEach(ctx => {
    ctx.afterEach.forEach(fn => {
      testFn(`${desc} [afterEach]`, fn, fn.opts);
    });
  });
}

process.nextTick(() => {
  test = pitesti();
  processCtx(currentCtx);
  test();
});

module.exports = {
  describe,
  it,
  context: describe,
  beforeEach,
  afterEach,
  before,
  after,
  beforeAll: before,
  afterAll: after
};
