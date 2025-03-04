import * as assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import * as _ from './index.js'

describe('Test turtledash', () => {
  it('should debounce', (context) => {
    const performance = global.performance
    context.before(() => {
      context.mock.timers.enable({ apis: ['Date', 'setTimeout'] })
      global.performance = Date as unknown as typeof global['performance']
    })
    context.after(() => {
      global.performance = performance
    })

    const callback = context.mock.fn()
    const callback2 = context.mock.fn()
    const debounced = _.debounce(callback, 500)
    const debounced2 = _.debounce(callback2, 500)
    debounced()
    context.mock.timers.tick(400)
    assert.equal(callback.mock.callCount(), 0)
    debounced()
    context.mock.timers.tick(400)
    assert.equal(callback.mock.callCount(), 0)
    context.mock.timers.tick(400)
    assert.equal(callback.mock.callCount(), 1)
    debounced()
    context.mock.timers.tick(200)
    assert.equal(callback.mock.callCount(), 1)
    context.mock.timers.tick(300)
    assert.equal(callback.mock.callCount(), 2)
    debounced2()
    debounced2()
    debounced2.flush()
    assert.equal(callback2.mock.callCount(), 1)
    debounced2()
    context.mock.timers.tick(450)
    debounced2.clear()
    assert.equal(callback2.mock.callCount(), 1)
  })
  it('should choose', () => {
    const a = _.choose([7, 3, 9, [0], 1], [0, 3])
    assert.deepEqual(a, [7, [0]])
  })
  it('should mapObject', () => {
    assert.deepEqual(_.mapObject({
      foo: 5,
      bar: 'asdf'
    }, ([key, value]) => {
      return [`process.env.${key}`, JSON.stringify(value)]
    }), {
      'process.env.foo': '5',
      'process.env.bar': '"asdf"'
    })
  })
  it('should merge', () => {
    const a = { a: 'taco', b: { a: 'burrito', b: 'combo' }, c: [20] }
    const b = { a: 'churro', b: { c: 'platter' } }
    const c = _.merge(a, b)
    assert.deepEqual(c, { a: 'churro', b: { a: 'burrito', b: 'combo', c: 'platter' }, c: [20] })
  })
  it('should flatten', () => {
    const a = [1, [2, [3, 4]], 5]
    const b = _.flatten(a)
    assert.deepEqual(b, [1, 2, [3, 4], 5]) // important: use deepEqual not equal
  })
  it('should zip', () => {
    const a = _.zip<number | string | boolean | null>([1, 2], ['a', 'b'], [true, false, null])
    const b = _.zip(['/foo/bar/node_modules/vue/dist/vue.common.js'])
    const c = _.zip(['/foo/bar/node_modules/vue/dist/vue.common.js'], [])
    assert.deepEqual(a, [[1, 'a', true], [2, 'b', false], [undefined, undefined, null]])
    assert.deepEqual(b, [['/foo/bar/node_modules/vue/dist/vue.common.js']])
    assert.deepEqual(c, [['/foo/bar/node_modules/vue/dist/vue.common.js', undefined]])
  })
  it('should deepEqual for JSON only', () => {
    assert.ok(_.deepEqualJSONType(4, 4))
    assert.ok(!_.deepEqualJSONType(4, 5))
    assert.ok(!_.deepEqualJSONType(4, new Number(4))) // eslint-disable-line
    assert.throws(() => _.deepEqualJSONType(new Number(4), new Number(4))) // eslint-disable-line
    assert.ok(_.deepEqualJSONType('asdf', 'asdf'))
    assert.throws(() => _.deepEqualJSONType(new String('asdf'), new String('asdf'))) // eslint-disable-line
    assert.ok(_.deepEqualJSONType({ a: 5, b: ['adsf'] }, { b: ['adsf'], a: 5 }))
    assert.ok(!_.deepEqualJSONType({ a: 5, b: ['adsf', {}] }, { b: ['adsf'], a: 5 }))
  })
})
