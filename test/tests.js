;(() => {
  'use strict'

  /* imports */
  const { equal, equalDeep } = require('fun-predicate')
  const { fun } = require('fun-type')
  const { ap, get } = require('fun-object')
  const { sync } = require('fun-test')
  const arrange = require('fun-arrange')
  const { of, take, repeat, concat } = require('fun-array')
  const { sub, div, mul, add } = require('fun-scalar')
  const compose = require('fun-compose')
  const apply = require('fun-apply')

  const equalityTests = [
    [[9], 9, 'id'],
    [[{}], {}, 'id']
  ].map(arrange({ inputs: 0, predicate: 1, contra: 2 }))
    .map(ap({
      predicate: equalDeep,
      contra: get
    }))

  const tests = [
    [
      [sub],
      compose(
        equal(-4),
        compose(
          apply([6, 12]),
          apply([sub, div])
        )
      ),
      'lift'
    ],
    [
      [sub],
      compose(
        equal(-1),
        compose(
          apply([6]),
          apply([div(2), div(3)])
        )
      ),
      'lift'
    ],
    [
      [sub],
      compose(
        fun,
        apply([div(2), div(3)])
      ),
      'lift'
    ],
    [[sub], fun, 'lift'],
    [
      [3, mul(2), 3],
      equal(24),
      'iterate'
    ],
    [
      [of],
      compose(equalDeep([undefined]), apply([])),
      'curry'
    ],
    [
      [Math.pow],
      compose(equal(8), apply([2, 3])),
      'curry'
    ],
    [
      [Math.pow],
      compose(fun, apply([3])),
      'curry'
    ],
    [
      [{ inputs: take(1), f: get(1) }, [3, add(4)]],
      equal(7),
      'applyFrom'
    ],
    [
      [[1, 2], sub],
      equal(1),
      'apply'
    ],
    [
      [compose(repeat(2), get(0)), sub],
      compose(equal(0), apply([7, 4])),
      'reArg'
    ],
    [
      [['a', 'b'], sub],
      compose(equal(-3), apply([{ a: 7, b: 4 }])),
      'argsToObject'
    ],
    [
      [sub],
      compose(equal(-3), apply([[7, 4]])),
      'argsToArray'
    ],
    [
      [sub],
      compose(equal(3), apply([7, 4])),
      'flip'
    ],
    [
      ['a', 3],
      equalDeep(['a', 3]),
      'args'
    ],
    [
      [2],
      compose(equal(true), apply(['0', 7, true])),
      'arg'
    ],
    [
      [1],
      compose(equal(7), apply(['0', 7, true])),
      'arg'
    ],
    [
      [0],
      compose(equal('0'), apply(['0', 1, true])),
      'arg'
    ],
    [
      [add(99), 4],
      equal(4),
      'tee'
    ],
    [
      [6],
      equal(6),
      'id'
    ],
    [
      [6],
      compose(equal(6), apply(['anything'])),
      'k'
    ],
    [
      [{ a: add(2), b: mul(2) }, 3],
      equalDeep({ a: 5, b: 6 }),
      'transfer'
    ],
    [
      [[add(2), mul(2)], 3],
      equalDeep([5, 6]),
      'transfer'
    ],
    [
      [add(2), mul(3)],
      compose(equal(5), apply([1])),
      'compose'
    ],
    [
      [[]],
      compose(equal(1), apply([1])),
      'composeAll'
    ],
    [
      [[add(2)]],
      compose(equal(3), apply([1])),
      'composeAll'
    ],
    [
      [[add(2), mul(3)]],
      compose(equal(5), apply([1])),
      'composeAll'
    ],
    [
      [add(2), mul(3)],
      compose(equal(9), apply([1])),
      'pipe'
    ],
    [
      [[]],
      compose(equal(1), apply([1])),
      'pipeAll'
    ],
    [
      [[add(2)]],
      compose(equal(3), apply([1])),
      'pipeAll'
    ],
    [
      [[add(2), mul(3)]],
      compose(equal(9), apply([1])),
      'pipeAll'
    ],
    [
      [add(2), mul(3)],
      compose(equal(5), apply([1])),
      'map'
    ],
    [
      [add(2), mul(3)],
      compose(equal(9), apply([1])),
      'contramap'
    ],
    [
      [add(2), mul(3), add(-2)],
      compose(equal(3), apply([1])),
      'dimap'
    ],
    [
      [[2, 2], 5, add],
      compose(equal(5), apply([2, 2])),
      'set'
    ],
    [
      [[2, 2], 5, add],
      compose(equal(6), apply([2, 4])),
      'set'
    ],
    [
      [[2, 2], mul(3), add],
      compose(equal(12), apply([2, 2])),
      'update'
    ],
    [
      [[2, 2], mul(3), add],
      compose(equal(6), apply([2, 4])),
      'update'
    ]
  ].map(arrange({ inputs: 0, predicate: 1, contra: 2 }))
    .map(ap({ contra: get }))

  /* exports */
  module.exports = [
    equalityTests,
    tests
  ].reduce(concat, [])
    .map(sync)
})()

