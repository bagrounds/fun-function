/**
 *
 * @module fun-function
 */
;(function () {
  'use strict'

  /* imports */
  var stringify = require('stringify-anything')
  var unfold = require('fun-unfold')
  var setProp = require('set-prop')

  /* exports */
  module.exports = {
    dimap: curry(dimap),
    map: curry(map),
    contramap: curry(contramap),
    compose: curry(compose),
    composeAll: composeAll,
    k: k,
    id: id,
    tee: curry(tee),
    arg: arg,
    args: args,
    reArg: curry(reArg),
    flip: flip,
    argsToArray: argsToArray,
    argsToObject: curry(argsToObject),
    iterate: curry(iterate),
    apply: curry(apply),
    applyFrom: curry(applyFrom),
    curry: curry
  }

  /**
   *
   * @function module:fun-function.curry
   *
   * @param {Function} f - function to curry
   * @param {Number} [arity] - number of arguments f should accept
   * @param {Array} [args] - initial arguments to apply
   *
   * @return {Function} a_1 -> a_2 -> ... -> a_arity -> f(a_1, ..., a_arity)
   */
  function curry (f, arity, args) {
    arity = arity || f.length
    args = args || []

    return setProp('name', partialName(f, args),
      setProp('length', arity, function () {
        var newPartialArgs = Array.prototype.slice.call(arguments)

        var newArgs = args.concat(
          newPartialArgs.length ? newPartialArgs : [undefined]
        )

        return newArgs.length >= arity
          ? f.apply(null, newArgs)
          : setProp('length', arity - newArgs.length, curry(f, arity, newArgs))
      })
    )

    function partialName (f, args) {
      return stringify(f) + '(' + stringify(args) + ')'
    }
  }

  /**
   * Warning: this function can't always set the length of the returned function
   * accurately because that is determined by the length of the array passed
   * to the input parameter function t, which cannot be known until t is called.
   * If t were to accept regular arguments instead of an array, the length
   * could be set properly - but with a loss of generality realized by
   * transforming an array (e.g. you can reverse an array of any length - so you
   * can use this function to reverse the order of arguments for a function that
   * accepts a variable number of arguments.)
   *
   * @function module:fun-function.reArg
   *
   * @param {Function} t - [tArgs] -> [fArgs]
   * @param {Function} f - fArgs -> z
   *
   * @return {Function} tArgs -> z
   */
  function reArg (t, f) {
    return setProp(
      'length',
      t.length,
      setProp('name', t.name + '(' + f.name + ')', result)
    )

    function result () {
      return apply(t(Array.prototype.slice.call(arguments)), f)
    }
  }

  /**
   *
   * @function module:fun-function.flip
   *
   * @param {Function} f - (a1, a2, ..., an) -> z
   *
   * @return {Function} (an, ..., a2, a1) -> z
   */
  function flip (f) {
    return setProp('length', f.length, reArg(reverse, f))

    function reverse (args) {
      return args.map(id).reverse()
    }
  }

  /**
   *
   * @function module:fun-function.argsToArray
   *
   * @param {Function} f - (a1, a2, ..., an) -> z
   *
   * @return {Function} ([a1, a2, ..., an]) -> z
   */
  function argsToArray (f) {
    return reArg(toArray, f)

    function toArray (args) {
      return args[0]
    }
  }

  /**
   *
   * @function module:fun-function.argsToObject
   *
   * @param {Array} keys - [k1, k2, ..., kn]
   * @param {Function} f - (a1, a2, ..., an) -> z
   *
   * @return {Function} ({k1: a1, k2: a2, ..., kn: an}) -> z
   */
  function argsToObject (keys, f) {
    return reArg(toObject, f)

    function toObject (object) {
      return keys.map(function (key) {
        return object[0][key]
      })
    }
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
   * @function module:fun-function.map
   *
   * @param {Function} f - y -> b
   * @param {Function} source - x -> y
   *
   * @return {Function} source.f
   */
  function map (f, source) {
    return compose(f, source)
  }

  /**
   *
   * @function module:fun-function.contramap
   *
   * @param {Function} f - a -> x
   * @param {Function} source - x -> y
   *
   * @return {Function} source.f
   */
  function contramap (f, source) {
    return compose(source, f)
  }

  /**
   *
   * @function module:fun-function.dimap
   *
   * @param {Function} f - a -> x
   * @param {Function} g - y -> b
   * @param {Function} source - x -> y
   *
   * @return {Function} g.source.f
   */
  function dimap (f, g, source) {
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
    return setProp(
      'length',
      g.length,
      setProp('name', stringify(f) + '.' + stringify(g), function () {
        return f(g.apply(null, arguments))
      }))
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
   * @function module:fun-function.tee
   *
   * @param {Function} f - x -> *
   * @param {*} x - argument to f
   *
   * @return {*} x
   */
  function tee (f, x) {
    f(x)

    return x
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

