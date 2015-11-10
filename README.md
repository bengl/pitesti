# PITESTI

**`pitesti`** is a tiny test framework for promises *only*. It's only been
tested on node v4.0.0, so YMMV on earlier versions of node/iojs.

## GOALS

* Only output [TAP](https://testanything.org/).
* Only allow promises for asynchronous testing.
* Only allow promises for any testing.
* Reject for fail, fulfill for pass.
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
```

Since one of the tests failed, the exit code is 1, rather than the 0 we'd get in
a 100% success case.

### Skip and Only

You can skip or isolate a test the same way you would in Mocha.

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

This framework is not suitable for situations where some things are happening
asynchonously outside of promises. In such cases, if errors are thrown, or
errbacks are ignored, you'll get undesired results. There is no use of domains
or the global error handlers. **Therefore, you should only use this framework
to test code that only uses Promises for async.**

## LICENSE

Code licensed under MIT license. See LICENSE.txt
