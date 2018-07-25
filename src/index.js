/**
 *
 * @module fun-function
 */
;(() => {
  'use strict'

  /* imports */
  const funCurry = require('fun-curry')
  const stringify = require('stringify-anything')
  const unfold = require('fun-unfold')
  const setProp = require('set-prop')
  const { inputs } = require('guarded')
  const { array, object, fun, num, vectorOf, tuple, arrayOf, objectOf, any,
    vector } = require('fun-type')
  const { equalDeep } = require('fun-predicate')

  const setName = (name, f) => setProp('name', name, f)
  const setLength = (length, f) => setProp('length', length, f)
  const oSet = (k, v, o) => Object.assign(o, { [k]: v })
  const oMap = (f, o) => Object.keys(o)
    .reduce((r, k) => oSet(k, f(o[k]), r), {})
  const oAp = (fs, o) => Object.keys(o)
    .reduce((r, k) => oSet(k, (fs[k] || (x => x))(o[k]), r), {})

  /**
   * Lift a function to operate on the results of other functions
   *
   * @function module:fun-function.lift
   *
   * @param {Function} f - (a, b, ...) -> z
   *
   * @return {Function} ((-> a), (-> b), ...) -> (-> z)
   */
  const lift = f => curry(
    setName(
      `lift(${stringify(f)})`,
      (...fs) => curry(
        setName(
          `lift(${stringify(f)})(${fs.map(stringify).join(',')})`,
          (...args) => f(...fs.slice(0, f.length).map(f => f(...args)))
        ),
        fs[0].length
      )
    ),
    f.length
  )

  /**
   *
   * @function module:fun-function.transfer
   *
   * @param {Array|Object} fs - functions to apply to source
   * @param {*} s - source to get values from
   *
   * @return {Array|Object} results of functions applied to source
   */
  const transfer = (fs, s) => fs instanceof Array
    ? fs.map(f => f(s))
    : Object.keys(fs).reduce((r, k) => oSet(k, fs[k](s), r), {})

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
  const curry = funCurry

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
  const reArg = (t, f) => setLength(
    t.length,
    setName(`${stringify(t)}(${stringify(f)})`, (...args) => f(...t(args)))
  )

  /**
   *
   * @function module:fun-function.flip
   *
   * @param {Function} f - (a1, a2, ..., an) -> z
   *
   * @return {Function} (an, ..., a2, a1) -> z
   */
  const flip = f => setLength(f.length, reArg(a => a.map(id).reverse(), f))

  /**
   *
   * @function module:fun-function.argsToArray
   *
   * @param {Function} f - (a1, a2, ..., an) -> z
   *
   * @return {Function} ([a1, a2, ..., an]) -> z
   */
  const argsToArray = f => reArg(([a]) => a, f)

  /**
   *
   * @function module:fun-function.argsToObject
   *
   * @param {Array} keys - [k1, k2, ..., kn]
   * @param {Function} f - (a1, a2, ..., an) -> z
   *
   * @return {Function} ({k1: a1, k2: a2, ..., kn: an}) -> z
   */
  const argsToObject = (keys, f) => reArg(([o]) => keys.map(k => o[k]), f)

  /**
   *
   * @function module:fun-function.args
   *
   * @return {Function} that returns its arguments as an array
   */
  const args = (...args) => args

  /**
   *
   * @function module:fun-function.arg
   *
   * @param {Number} n - index of argument to return
   *
   * @return {Function} that returns its nth argument
   */
  const arg = n => compose(o => o[n], args)

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
  const applyFrom = ({inputs, f}, source) => lift(apply)(inputs, f)(source)

  /**
   *
   * @function module:fun-function.apply
   *
   * @param {Array} args - to apply to f
   * @param {Function} f - function to apply arguments to
   *
   * @return {Function} result of f(...args)
   */
  const apply = (args, f) => f(...args)

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
  const iterate = (n, f, x) => unfold(
    ([i, x]) => [i + 1, f(x)],
    ([i]) => i >= n,
    [0, x]
  )[1]

  /**
   *
   * @function module:fun-function.compose
   *
   * @param {Function} f - a unary function
   * @param {Function} g - an N-ary function
   *
   * @return {Function} (f <<< g) - N-ary, right-to-left composition of f and g
   */
  const compose = (f, g) => setLength(
    g.length,
    setName(
      `${stringify(f)} <<< ${stringify(g)}`,
      (...args) => f(g(...args))
    )
  )

  /**
   *
   * @function module:fun-function.composeAll
   *
   * @param {Array<Function>} fs - [y -> z, ..., b -> c, a -> b]
   *
   * @return {Function} a -> z
   */
  const composeAll = fs =>
    fs.length === 0 ? id : fs.length === 1 ? fs[0] : fs.reduce(compose)

  /**
   *
   * @function module:fun-function.pipe
   *
   * @param {Function} f - an N-ary function
   * @param {Function} g - a unary function
   *
   * @return {Function} (f >>> g) - N-ary, left-to-right composition of f and g
   */
  const pipe = (f, g) => setLength(
    g.length,
    setName(
      `${stringify(f)} >>> ${stringify(g)}`,
      (...args) => g(f(...args))
    )
  )

  /**
   *
   * @function module:fun-function.pipeAll
   *
   * @param {Array<Function>} fs - [a -> b, b -> c, ..., y -> z]
   *
   * @return {Function} a -> z
   */
  const pipeAll = fs =>
    fs.length === 0 ? id : fs.length === 1 ? fs[0] : fs.reduce(pipe)

  /**
   *
   * @function module:fun-function.map
   *
   * @param {Function} f - y -> b
   * @param {Function} source - x -> y
   *
   * @return {Function} source.f
   */
  const map = compose

  /**
   *
   * @function module:fun-function.contramap
   *
   * @param {Function} f - a -> x
   * @param {Function} source - x -> y
   *
   * @return {Function} source.f
   */
  const contramap = flip(map)

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
  const dimap = (f, g, source) => composeAll([g, source, f])

  /**
   *
   * @function module:fun-function.id
   *
   * @param {*} a - anything
   *
   * @return {*} a
   */
  const id = a => a

  /**
   *
   * @function module:fun-function.tee
   *
   * @param {Function} f - x -> *
   * @param {*} x - argument to f
   *
   * @return {*} x
   */
  const tee = (f, x) => { f(x); return x }

  /**
   *
   * @function module:fun-function.k
   *
   * @param {*} a - anything
   * @param {*} b - anything
   *
   * @return {*} a
   */
  const k = (a, b) => a

  /**
   *
   * @function module:fun-function.get
   *
   * @param {*} key - array of arguments to get value in f from
   * @param {*} f - function to get a result from
   *
   * @return {*} a
   */
  const get = apply

  /**
   *
   * @function module:fun-function.set
   *
   * @param {*} key - array of arguments to set value on f to
   * @param {*} value - value to set
   * @param {*} f - function to set a result for
   *
   * @return {*} a
   */
  const set = (key, value, f) => (...args) =>
    equalDeep(args, key) ? value : apply(args, f)

  /**
   *
   * @function module:fun-function.update
   *
   * @param {*} key - array of arguments to update value on f to
   * @param {*} u - update function
   * @param {*} f - function to update a result for
   *
   * @return {*} a
   */
  const update = (key, u, f) => (...args) =>
    equalDeep(args, key) ? u(apply(args, f)) : apply(args, f)

  const api = { transfer, dimap, map, contramap, compose, composeAll, k, id,
    tee, arg, args, reArg, flip, argsToArray, argsToObject, iterate, apply,
    applyFrom, lift, pipe, pipeAll, set, get, update }

  const or = (f, g) => x => f(x) || g(x)
  const nFuns = n => vectorOf(n)(fun)

  const guards = {
    transfer: inputs(tuple([or(arrayOf(fun), objectOf(fun)), any])),
    dimap: inputs(nFuns(3)),
    map: inputs(nFuns(2)),
    contramap: inputs(nFuns(2)),
    compose: inputs(nFuns(2)),
    composeAll: inputs(tuple([arrayOf(fun)])),
    tee: inputs(tuple([fun, any])),
    arg: inputs(tuple([num])),
    reArg: inputs(nFuns(2)),
    flip: inputs(nFuns(1)),
    argsToArray: inputs(nFuns(1)),
    argsToObject: inputs(tuple([array, fun])),
    iterate: inputs(tuple([num, fun, any])),
    apply: inputs(tuple([array, fun])),
    curry: inputs(nFuns(1)),
    applyFrom: inputs(tuple([object, any])),
    lift: inputs(nFuns(1)),
    k: inputs(vector(2)),
    set: inputs(tuple([array, any, fun])),
    update: inputs(tuple([array, fun, fun]))
  }

  /* exports */
  module.exports = oSet('curry', curry, oMap(funCurry, oAp(guards, api)))
})()

