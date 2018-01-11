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

  const setName = (name, f) => setProp('name', name, f)
  const setLength = (length, f) => setProp('length', length, f)
  const oSet = (k, v, o) => Object.assign(o, { [k]: v })
  const oMap = (f, o) => Object.keys(o)
    .reduce((r, k) => oSet(k, o[k], r), {})
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
          (...args) => apply(fs.slice(0, f.length).map(curry(apply)(args)), f)
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
    setName(`${t.name}(${f.name})`, (...args) => apply(t(args), f))
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
  const argsToObject = (keys, f) => reArg(args => keys.map(k => args[0][k]), f)

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
  const apply = (args, f) => f.apply(null, args)

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
    pair => [pair[0] + 1, f(pair[1])],
    pair => pair[0] >= n,
    [0, x]
  )[1]

  /**
   *
   * @function module:fun-function.compose
   *
   * @param {Function} f - a unary function
   * @param {Function} g - an N-ary function
   *
   * @return {Function} (f . g) - the N-ary function composition of f and g
   */
  const compose = (f, g) => setLength(
    g.length,
    setName(
      `${stringify(f)}.${stringify(g)}`,
      (...args) => f(apply(args, g))
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
  const composeAll = fs => fs.reduce(compose, id)

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
   *
   * @return {Function} * -> a
   */
  const k = a => () => a

  const api = { transfer, dimap, map, contramap, compose, composeAll, k, id,
    tee, arg, args, reArg, flip, argsToArray, argsToObject, iterate, apply,
    applyFrom, curry, lift }

  const ap = fs => as => as.map((x, i) => fs[i](x))
  const isType = t => x => typeof x === t
  const isFun = isType('function')
  const isNum = isType('number')
  const isObj = o => o instanceof Object
  const isArray = a => a instanceof Array
  const all = a => a.reduce((a, b) => a && b, true)
  const allF = f => a => all(a.map(f))
  const arrayOf = p => a => isArray(a) && allF(p)(a)
  const objOf = p => o => isObj(o) && all(Object.keys(o).map(k => p(o[k])))
  const isVector = n => a => isArray(a) && a.length === n
  const vectorOf = n => p => a => isVector(n)(a) && arrayOf(p)(a)
  const tuple = ps => as => as.length === ps.length && all(ap(ps)(as))
  const any = () => true
  const or = (f, g) => x => f(x) || g(x)
  const nFuns = n => vectorOf(n)(isFun)

  const guards = {
    transfer: inputs(tuple([or(arrayOf(isFun), objOf(isFun)), any])),
    dimap: inputs(nFuns(3)),
    map: inputs(nFuns(2)),
    contramap: inputs(nFuns(2)),
    compose: inputs(nFuns(2)),
    composeAll: inputs(tuple([arrayOf(isFun)])),
    tee: inputs(tuple([isFun, any])),
    arg: inputs(tuple([isNum])),
    reArg: inputs(nFuns(2)),
    flip: inputs(nFuns(1)),
    argsToArray: inputs(nFuns(1)),
    argsToObject: inputs(tuple([isArray, isFun])),
    iterate: inputs(tuple([isNum, isFun, any])),
    apply: inputs(tuple([isArray, isFun])),
    curry: inputs(nFuns(1)),
    applyFrom: inputs(tuple([isObj, any])),
    lift: inputs(nFuns(1))
  }

  /* exports */
  module.exports = oMap(curry, oAp(guards, api))
})()

