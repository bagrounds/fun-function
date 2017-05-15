;(function () {
  'use strict'

  /* imports */
  var predicate = require('fun-predicate')
  var object = require('fun-object')
  var funTest = require('fun-test')
  var arrange = require('fun-arrange')
  var array = require('fun-array')
  var scalar = require('fun-scalar')
  var compose = require('fun-compose')
  var apply = require('fun-apply')

  var equalityTests = [
    [[9], 9, 'id'],
    [[{}], {}, 'id']
  ].map(arrange({ inputs: 0, predicate: 1, contra: 2 }))
    .map(object.ap({
      predicate: predicate.equalDeep,
      contra: object.get
    }))

  var tests = [
    [
      [scalar.sub],
      compose(
        predicate.equal(-4),
        compose(
          apply([6, 12]),
          apply([scalar.sub, scalar.div])
        )
      ),
      'lift'
    ],
    [
      [scalar.sub],
      compose(
        predicate.equal(-1),
        compose(
          apply([6]),
          apply([scalar.div(2), scalar.div(3)])
        )
      ),
      'lift'
    ],
    [
      [scalar.sub],
      compose(
        predicate.type('Function'),
        apply([scalar.div(2), scalar.div(3)])
      ),
      'lift'
    ],
    [[scalar.sub], predicate.type('Function'), 'lift'],
    [
      [3, scalar.dot(2), 3],
      predicate.equal(24),
      'iterate'
    ],
    [
      [array.of],
      compose(predicate.equalDeep([undefined]), apply([])),
      'curry'
    ],
    [
      [Math.pow],
      compose(predicate.equal(8), apply([2, 3])),
      'curry'
    ],
    [
      [Math.pow],
      compose(predicate.type('Function'), apply([3])),
      'curry'
    ],
    [
      [{ inputs: array.take(1), f: array.get(1) }, [3, scalar.sum(4)]],
      predicate.equal(7),
      'applyFrom'
    ],
    [
      [[1, 2], scalar.sub],
      predicate.equal(1),
      'apply'
    ],
    [
      [compose(array.repeat(2), array.get(0)), scalar.sub],
      compose(predicate.equal(0), apply([7, 4])),
      'reArg'
    ],
    [
      [['a', 'b'], scalar.sub],
      compose(predicate.equal(-3), apply([{ a: 7, b: 4 }])),
      'argsToObject'
    ],
    [
      [scalar.sub],
      compose(predicate.equal(-3), apply([[7, 4]])),
      'argsToArray'
    ],
    [
      [scalar.sub],
      compose(predicate.equal(3), apply([7, 4])),
      'flip'
    ],
    [
      ['ignored'],
      compose(predicate.equalDeep(['a', 3]), apply(['a', 3])),
      'args'
    ],
    [
      [2],
      compose(predicate.equal(true), apply(['0', 7, true])),
      'arg'
    ],
    [
      [1],
      compose(predicate.equal(7), apply(['0', 7, true])),
      'arg'
    ],
    [
      [0],
      compose(predicate.equal('0'), apply(['0', 1, true])),
      'arg'
    ],
    [
      [scalar.sum(99), 4],
      predicate.equal(4),
      'tee'
    ],
    [
      [6],
      predicate.equal(6),
      'id'
    ],
    [
      [6],
      compose(predicate.equal(6), apply(['anything'])),
      'k'
    ],
    [
      [{ a: scalar.sum(2), b: scalar.dot(2) }, 3],
      predicate.equalDeep({ a: 5, b: 6 }),
      'transfer'
    ],
    [
      [[scalar.sum(2), scalar.dot(2)], 3],
      predicate.equalDeep([5, 6]),
      'transfer'
    ],
    [
      [scalar.sum(2), scalar.dot(3)],
      compose(predicate.equal(5), apply([1])),
      'compose'
    ],
    [
      [[scalar.sum(2), scalar.dot(3)]],
      compose(predicate.equal(5), apply([1])),
      'composeAll'
    ],
    [
      [scalar.sum(2), scalar.dot(3)],
      compose(predicate.equal(5), apply([1])),
      'map'
    ],
    [
      [scalar.sum(2), scalar.dot(3)],
      compose(predicate.equal(9), apply([1])),
      'contramap'
    ],
    [
      [scalar.sum(2), scalar.dot(3), scalar.sum(-2)],
      compose(predicate.equal(3), apply([1])),
      'dimap'
    ]
  ].map(arrange({ inputs: 0, predicate: 1, contra: 2 }))
    .map(object.ap({
      contra: object.get
    }))

  /* exports */
  module.exports = [
    equalityTests,
    tests
  ].reduce(array.concat, [])
    .map(funTest.sync)
})()

