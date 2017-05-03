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
    arg: arg,
    args: args,
    iterate: curry(iterate),
    apply: curry(apply),
    applyFrom: curry(applyFrom)
  }

  /**
   *
   * @function module:fun-function.args
   *
   * @return {Function} that returns its arguments as an array
   */
  function args () {
    return function args () {
      return Array.prototype.slice.call(arguments)
    }
  }

  /**
   *
   * @function module:fun-function.arg
   *
   * @param {Number} n - index of argument to return
   *
   * @return {Function} that returns its nth argument
   */
  function arg (n) {
    return function () {
      return arguments[n]
    }
  }

  /**
   *
   * @function module:fun-function.applyFrom
   *
   * @param {Object} options - input parameters
   * @param {Function} options.inputs - source -> [...args]
   * @param {Function} options.f - source -> ([...args] -> *)
   * @param {*} source - for inputs and f
   *
   * @return {*} result of f(source)(...inputs(source))
   */
  function applyFrom (options, source) {
    return apply(options.inputs(source), options.f(source))
  }

  /**
   *
   * @function module:fun-function.apply
   *
   * @param {Array} args - to apply to f
   * @param {Function} f - function to apply arguments to
   *
   * @return {Function} result of f(...args)
   */
  function apply (args, f) {
    return f.apply(null, args)
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

