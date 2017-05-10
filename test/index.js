#!/usr/bin/env node
;(function () {
  'use strict'

  /* imports */
  var tests = require('./tests')
  var runner = require('fun-test-runner')
  var subject = require('../src')

  main()

  function main () {
    runner(tests, subject).fork(testError, id)
  }

  function testError (error) {
    console.error('TEST_ERROR:' + error.message)
  }

  function id (x) {
    return x
  }
})()

