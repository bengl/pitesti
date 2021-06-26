'use strict';

const assert = require('assert');
const { join } = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const { readFile } = require('fs');
const execAsync = promisify(exec);
const readFileAsync = promisify(readFile);

async function runAndTest (file) {
  const expected = await readFileAsync(join('test', 'fixtures', file + '.out'));
  const actual = await execAsync(`node ${join('test', 'fixtures', file + '.js')}`);
  console.log(actual.stdout);
  assert.strictEqual(expected.toString('utf8'), actual.stdout.toString('utf8'));
}

module.exports = cb => {
  (async () => {
    try {
      await runAndTest('bdd-test1');
      await runAndTest('bdd-test2');
    } catch (e) {
      console.log(e);
      throw e;
    }
  })().then(cb, cb);
};

if (require.main === module) {
  module.exports(function () {});
}
