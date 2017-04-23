/**
 *
 * @module fun-function
 */
;(function () {
  'use strict'

  /* imports */
  var curry = require('fun-curry')
  var compose = require('fun-compose')

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
   * @return {Function} of elements in this array
   */
  function diMap (f, g, source) {
    return composeAll([g, source, f])
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

