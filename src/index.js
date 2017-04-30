/**
 *
 * @module fun-function
 */
;(function () {
  'use strict'

  /* imports */
  var curry = require('fun-curry')
  var funCompose = require('fun-compose')
  var unfold = require('fun-unfold')

  /* exports */
  module.exports = {
    diMap: curry(diMap),
    compose: curry(compose),
    composeAll: composeAll,
    k: k,
    id: id,
    iterate: curry(iterate)
  }

  /**
   *
   * @function module:fun-function.iterate
   *
   * @param {Number} n - number of times to iterate f
   * @param {Function} f - x -> x
   * @param {*} x - initial argument to f
   *
   * @return {Function} f(f(...f(x)...)) (f applied to x n times)
   */
  function iterate (n, f, x) {
    return unfold(next, stop, [0, x])[1]

    function next (pair) {
      return [pair[0] + 1, f(pair[1])]
    }

    function stop (pair) {
      return pair[0] >= n
    }
  }

  /**
   *
   * @function module:fun-function.diMap
   *
   * @param {Function} f - a -> x
   * @param {Function} g - y -> b
   * @param {Function} source - x -> y
   *
   * @return {Function} g.source.f
   */
  function diMap (f, g, source) {
    return composeAll([g, source, f])
  }

  /**
   *
   * @function module:fun-function.compose
   *
   * @param {Function} f - a unary function
   * @param {Function} g - an N-ary function
   *
   * @return {Function} (f . g) - the N-ary function composition of f and g
   */
  function compose (f, g) {
    return funCompose(f, g)
  }

  /**
   *
   * @function module:fun-function.composeAll
   *
   * @param {Array<Function>} functions - [y -> z, ..., b -> c, a -> b]
   *
   * @return {Function} a -> z
   */
  function composeAll (functions) {
    return functions.reduce(compose, id)
  }

  /**
   *
   * @function module:fun-function.id
   *
   * @param {*} a - anything
   *
   * @return {*} a
   */
  function id (a) {
    return a
  }

  /**
   *
   * @function module:fun-function.k
   *
   * @param {*} a - anything
   *
   * @return {Function} * -> a
   */
  function k (a) {
    return function () {
      return a
    }
  }
})()

