# PITESTI

[![Build Status](https://travis-ci.org/bengl/pitesti.svg?branch=master)](https://travis-ci.org/bengl/pitesti)

**`pitesti`** is a tiny but useful test framework for Node.js. It's only been
tested on node v4.x, so YMMV on earlier versions of node.

## GOALS

* Only output [TAP](https://testanything.org/).
* Allow just about anything to be passed in as a "test". For example:
   * A function that either throws or doesn't.
   * A function taking a nodeback/errback, where the error indicates test fail.
   * A promise (whose result is assumed by the test).
   * A function returning a promise (whose result is assumed by the test).
* Super-simple test definition format.
* No setup or teardown functions.
* Only care about node version >= 4.

## USAGE

First, create a test suite.

```js
let test = require('pitesti')()
```

`pitesti` exports a single function which creates test suites. It takes in an
options object (or nothing) with the following values:

* `outputStream`: where to write TAP output. Default is `process.stdout`.
* `summary`: whether or not to write a summary to the `outputStream` and the end
of testing. Default is `true`.
* `done`: a callback function that will take in an exit code. Default is
`process.exit`.

Now you can write some tests and run them.

```js
let test = require('pitesti')()

// any function returning a promise can be a test
test('foo example test 1', function(){
    return Promise.resolve();
})

// a failing test is one that returns a (eventually) rejecting promise
test('foo example test 2', function(){
    return Promise.reject(new Error('bad'))
})

// if you already have some promises lying around, you can pass those in
let myPromise = Promise.resolve()
test('foo example test 3', myPromise)

// you can call test as a template literal, for a fun DSL
test `foo example test 4` (() => Promise.resolve('good'))

// you can also have tests that just call a callback or throw
test `foo example test 5` (cb => {
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

### Multiple Files

There is no facility for running tests from multiple files, but you could write
test files as functions taking in the test suite function, and then pass that
in to each module from a main test file.

### Grouping

There is no facility for grouping tests by class, module, file, or anything like
that. If you want to do so, it's fairly straightforward to construct it
yourself.

```js
function testMyClass(name, fn) {
    test('MyClass '+name, fn)
}

testMyClass('does a thing', /* ... */)
testMyClass('does another thing', /* ... */)

/*
would produce output like:

ok 1 MyClass does a thing
ok 2 MyClass does another thing

*/
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
