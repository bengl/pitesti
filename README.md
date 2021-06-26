# PITESTI

[![Build Status](https://travis-ci.org/bengl/pitesti.svg?branch=master)](https://travis-ci.org/bengl/pitesti)

**`pitesti`** is a tiny but useful test framework for Node.js. Node 12.x and
higher are supported.

You can also use `pitesti` in browsers. See below for details.

## GOALS

* Only output [TAP](https://testanything.org/).
* Allow just about anything to be passed in as a "test". For example:
   * A function that either throws or doesn't.
   * A function taking a nodeback/errback, where the error indicates test fail.
   * A promise (whose result is assumed by the test).
   * A function returning a promise (whose result is assumed by the test).
* Super-simple test definition format.
* No setup or teardown functions.
* Only care about Node.js major versions that aren't EOL.

## USAGE

First, create a test suite.

```js
const test = require('pitesti')()
```

`pitesti` exports a single function which creates test suites. It takes in an
options object (or nothing) with the following values:

* `outputStream`: where to write TAP output. Default is `process.stdout`.
* `summary`: whether or not to write a summary to the `outputStream` and the end
of testing. Default is `true`.
* `timeout`: Milliseconds after which to fail the test if it hasn't passed yet.
Default is 5000. See "Timeouts" below.
* `contextSeparator`: String used to separate context names from test names.
  Default is `' '`.
* `done`: a callback function that will take in an exit code. Default is
`process.exit`.

Now you can write some tests and run them.

```js
const test = require('pitesti')()

// any function returning a promise can be a test
test('foo example test 1', function(){
    return Promise.resolve();
})

// a failing test is one that returns a (eventually) rejecting promise
test('foo example test 2', function(){
    return Promise.reject(new Error('bad'))
})

// async functions also work just fine!
test('foo example test 3', async function(){
    await something()
})

// if you already have some promises lying around, you can pass those in
let myPromise = Promise.resolve()
test('foo example test 4', myPromise)

// you can call test as a template literal, for a fun DSL
test `foo example test 5` (() => Promise.resolve('good'))

// you can also have tests that just call a callback or throw
test `foo example test 6` (cb => {
    maybeThrow()
    maybeCallBackWithError(cb)
})

// this starts running the suite
test()
```

This will run the tests, outputting to the `outputStream`, and when done will
call `done`, so in this example it will print the following to `stdout` and then
exit.

```
TAP version 13
1..3
ok 1 foo example 1
not ok 2 foo example 2
  ---
  name: Error
  message: bad
  stack: |-
    Error: bad
      <stacktrace line 1>
      <stacktrace line 2>
      <stacktrace line 3>
      <...>
  ...
ok 3 foo example 3
ok 3 foo example 4
```

Since one of the tests failed, the exit code is 1, rather than the 0 we'd get in
a 100% success case.

### Assertions

You can use whatever assertion library you want, provided that you return a
Promise whose end-result passes or fails the test, or just simply throw. Pretty
much every assertion library falls under this, so you should be fine.

### Skip and Only

You can skip or isolate a test the same way you would in Mocha. The template
literal forms work as with just `test`.

```js
test.only('only this test will run', function(){
    // ...
})
```

```js
test.skip('all tests except this one will run', function(){
    // ...
})
```

### Timeouts

By default, each test case has a time limit of 5000ms, after which the test will
be considered a failure.

You can set a global timeout for an entire test suite using the options object
as described above. You can also pass a third argument to the `test` function
that is an options object containing a timeout option, in order to set a timeout
for a specific test:

```js
test('this is a test with a 1 second timeout', () => {
    // ...
}, { timeout: 1000 })
```

To completely disable timeouts, you can set a `timeout` property to `Infinity`.

### Multiple Files

Pitesti isn't designed with files in mind. That means you're free to do whatever
you want.

There are two main suggested approaches to take:

1. Write test files as functions taking in the test suite function, and then
   pass that in to each module from a main test file.
2. Use a tool like the [`node-tap` cli ](http://www.node-tap.org/cli/) to run
   all your test files as individual suites.

### Grouping, Contexts, Subtests

You can add a layer of context to tests by using `test.context`:

```js
test.context('MyClass', () => {
    test('foo', () => { /* ... */ })
    test('bar', () => { /* ... */ })
})
```

You can do this up to an arbitrary depth.

You can change the separator used in the TAP output by using the
`contextSeparator` option as defined above.

You can also add TAP-standard unbuffered subtests:

```js
test.subtest('MyClass', () => {
    test('foo', () => { /* ... */ })
    test('bar', () => { /* ... */ })
})
```

These will output as indented tests. Any tests contained within either contexts
or subtests will count toward your test totals shown in the summary.

### Browser Usage

Pitesti can be used in a browser environment via
[`webpack`](https://webpack.js.org/), [`browserify`](http://browserify.org/), or
other web packaging tools.

You'll have to set an `outputStream`, so if you're using one of the tools above,
you should be able to do something like:

```js
const pitesti = require('pitesti')
const { Writable } = require('stream')
const out = document.getElementById('test-output')
const outputStream = new Writable({
  write(chunk, encoding, cb) {
    out.innerHTML += chunk
    cb()
  }
})
const test = pitesti({ outputStream });
```

### Caveats

* Pitesti runs tests _sequentially_. While running in "parallel" might sound
better, in reality, many real-world tests involve singletons and other global
state that's changed throught the course of a single test. It's far easier to
reason about what's going on if only one test can be causing an error at any
given time.
* If your code fails to examine errors in errbacks/nodebacks, or does not handle
promise rejections, you may find that these errors are invisible. The position
taken by Pitesti is that if you're ignoring an error, you don't care that it's
an error, and it's not a problem for your code.

## LICENSE

Code licensed under MIT license. See LICENSE.txt
