'use strict';

const assert = require('assert');
const { Writable } = require('stream');
const pitesti = require('../index');

function getFakeStream () {
  const fakeStream = new Writable();

  fakeStream.buff = '';
  fakeStream._write = function (chunk, _enc, next) {
    this.buff += chunk.toString();
    next();
  };
  return fakeStream;
}

function getTest ({
  expected,
  cb = () => {},
  expectedCode = 0,
  config = {},
  defaults = false
}) {
  const fakeStream = getFakeStream();
  return pitesti(defaults ? {} : Object.assign({
    outputStream: fakeStream,
    done (code) {
      try {
        console.log(fakeStream.buff.trim());
        // console.log(require('util').inspect(fakeStream.buff.trim()))
        // console.log(require('util').inspect(expected.trim()))
        assert.strictEqual(code, expectedCode);
        assert.strictEqual(fakeStream.buff.trim(), expected.trim());
        cb();
      } catch (e) {
        console.error(e.stack);
        process.exit(1);
      }
    }
  }, config));
}

module.exports = {
  getTest,
  getFakeStream
};
