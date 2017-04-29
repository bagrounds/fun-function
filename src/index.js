/**
 *
 * @module fun-function
 */
;(function () {
  'use strict'

  /* imports */
  var curry = require('fun-curry')
  var funCompose = require('fun-compose')

  /* exports */
  module.exports = {
    diMap: curry(diMap),
    compose: curry(compose),
    composeAll: composeAll,
    k: k,
    id: id
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

