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
  describe('safeDefine', () => {
    it('defines a writable, enumerable and configurable own property', () => {
      const target: Record<string, unknown> = {}
      const value = { count: 1 }
      assert.equal(_.safeDefine(target, 'value', value), undefined)
      assert.deepEqual(Object.getOwnPropertyDescriptor(target, 'value'), {
        value,
        writable: true,
        enumerable: true,
        configurable: true
      })
      assert.equal(target.value, value)
      assert.deepEqual(Object.keys(target), ['value'])
      _.safeDefine(target, 'value', 2)
      assert.equal(target.value, 2)
      target.value = 3
      assert.equal(target.value, 3)
      assert.ok(delete target.value)
      assert.ok(!_.has(target, 'value'))
    })
    it('defines properties on null-prototype objects', () => {
      const target: Record<string, unknown> = Object.create(null)
      _.safeDefine(target, 'value', undefined)
      assert.equal(Object.getPrototypeOf(target), null)
      assert.ok(_.has(target, 'value'))
      assert.equal(target.value, undefined)
    })
    it('shadows inherited setters without invoking them', (context) => {
      const getter = context.mock.fn()
      const setter = context.mock.fn()
      const prototype = Object.defineProperty({}, 'value', { get: getter, set: setter })
      const target: Record<string, unknown> = Object.create(prototype)
      _.safeDefine(target, 'value', 1)
      assert.equal(getter.mock.callCount(), 0)
      assert.equal(setter.mock.callCount(), 0)
      assert.ok(_.has(target, 'value'))
      assert.equal(target.value, 1)
      assert.equal(Object.getPrototypeOf(target), prototype)
      assert.equal(Object.getOwnPropertyDescriptor(prototype, 'value')?.set, setter)
    })
    it('replaces configurable own accessors without invoking them', (context) => {
      const getter = context.mock.fn()
      const setter = context.mock.fn()
      const target: Record<string, unknown> = {}
      Object.defineProperty(target, 'value', { get: getter, set: setter, configurable: true })
      _.safeDefine(target, 'value', 1)
      assert.equal(getter.mock.callCount(), 0)
      assert.equal(setter.mock.callCount(), 0)
      assert.deepEqual(Object.getOwnPropertyDescriptor(target, 'value'), {
        value: 1,
        writable: true,
        enumerable: true,
        configurable: true
      })
    })
    it('stores literal __proto__ keys without changing prototypes', () => {
      const value = { injected: 1 }
      const targets: Record<string, unknown>[] = [{}, Object.create(null)]
      for (const target of targets) {
        const prototype = Object.getPrototypeOf(target)
        _.safeDefine(target, '__proto__', value)
        assert.equal(Object.getPrototypeOf(target), prototype)
        assert.ok(_.has(target, '__proto__'))
        assert.equal(Object.getOwnPropertyDescriptor(target, '__proto__')?.value, value)
        assert.ok(!_.has(target, 'injected'))
        assert.equal(target.injected, undefined)
      }
      assert.ok(!_.has(Object.prototype, 'injected'))
    })
    it('throws when a property cannot be defined', () => {
      const nonExtensible = Object.preventExtensions({})
      assert.throws(() => _.safeDefine(nonExtensible, 'value', 1), TypeError)
      assert.ok(!_.has(nonExtensible, 'value'))
      const locked = Object.freeze({ value: 1 })
      assert.throws(() => _.safeDefine(locked, 'value', 2), TypeError)
      assert.equal(locked.value, 1)
    })
  })
  describe('cloneValue', () => {
    it('clones nested arrays and plain objects independently of the source', () => {
      const source = { items: [{ count: 1, nested: [2] }], empty: {} }
      const copy = _.cloneValue(source)
      assert.deepEqual(copy, source)
      assert.notEqual(copy, source)
      assert.notEqual(copy.items, source.items)
      assert.notEqual(copy.items[0], source.items[0])
      assert.notEqual(copy.items[0].nested, source.items[0].nested)
      assert.notEqual(copy.empty, source.empty)
      assert.equal(Object.getPrototypeOf(copy), Object.prototype)
      copy.items[0].count = 3
      copy.items[0].nested.push(4)
      assert.deepEqual(source, { items: [{ count: 1, nested: [2] }], empty: {} })
      assert.deepEqual(_.cloneValue([]), [])
    })
    it('returns primitive values unchanged', () => {
      const values = [null, undefined, true, false, 0, -0, 42, NaN, Infinity, '', 'value', BigInt(1), Symbol('value')]
      for (const value of values) {
        assert.equal(_.cloneValue(value), value)
      }
    })
    it('preserves explicit undefined object properties and array elements', () => {
      const source = { optional: undefined, items: [undefined] }
      const copy = _.cloneValue(source)
      assert.deepEqual(copy, source)
      assert.ok(_.has(copy, 'optional'))
      assert.ok(_.has(copy.items, 0))
      assert.notEqual(copy.items, source.items)
    })
    it('normalizes array holes to null without changing the source', () => {
      const source: unknown[] = new Array(5)
      source[1] = { count: 1 }
      source[3] = undefined
      const copy = _.cloneValue(source)
      assert.deepEqual(copy, [null, { count: 1 }, null, undefined, null])
      assert.notEqual(copy[1], source[1])
      for (let index = 0; index < copy.length; index++) {
        assert.ok(_.has(copy, index))
      }
      for (const index of [0, 2, 4]) {
        assert.ok(!_.has(source, index))
      }
      assert.deepEqual(_.cloneValue({ items: new Array(2) }), { items: [null, null] })
    })
    it('preserves null prototypes at the root and in nested containers', () => {
      const source: Record<string, { items: number[] }> = Object.create(null)
      source.entry = { items: [1] }
      const copy = _.cloneValue(source)
      assert.equal(Object.getPrototypeOf(copy), null)
      assert.deepEqual(copy, source)
      assert.notEqual(copy, source)
      assert.notEqual(copy.entry, source.entry)
      assert.notEqual(copy.entry.items, source.entry.items)
      copy.entry.items.push(2)
      assert.deepEqual(source.entry.items, [1])
      const nested = _.cloneValue({ items: [source] })
      assert.equal(Object.getPrototypeOf(nested.items[0]), null)
      assert.notEqual(nested.items[0], source)
      assert.deepEqual(nested.items[0], source)
    })
    it('returns functions and non-plain objects by reference, including nested values', () => {
      class Example {
        count = 1
      }
      const values = [() => 1, new Date(0), new Map([['count', 1]]), new Set([1]), /value/g, new Uint8Array([1]), new Example()]
      for (const value of values) {
        assert.equal(_.cloneValue(value), value)
        const copy = _.cloneValue({ value, items: [value] })
        assert.equal(copy.value, value)
        assert.equal(copy.items[0], value)
      }
    })
    it('copies only enumerable string keys on objects and indexed array elements', () => {
      const symbol = Symbol('hidden')
      const source = { visible: { count: 1 }, [symbol]: 2 }
      Object.defineProperty(source, 'hidden', { value: 3 })
      const copy = _.cloneValue(source)
      assert.deepEqual(copy, { visible: { count: 1 } })
      assert.ok(!_.has(copy, 'hidden'))
      assert.ok(!_.has(copy, 'toString'))
      assert.deepEqual(Object.getOwnPropertySymbols(copy), [])
      const array = Object.assign([{ count: 1 }], { extra: 2 })
      const arrayCopy = _.cloneValue(array)
      assert.deepEqual(arrayCopy, [{ count: 1 }])
      assert.notEqual(arrayCopy[0], array[0])
      assert.ok(!_.has(arrayCopy, 'extra'))
    })
    it('clones literal __proto__ keys without changing prototypes', () => {
      const value = { injected: 1 }
      const source = { ['__proto__']: value }
      const copy = _.cloneValue(source)
      assert.deepEqual(copy, source)
      assert.equal(Object.getPrototypeOf(copy), Object.prototype)
      assert.ok(_.has(copy, '__proto__'))
      const copiedValue = Object.getOwnPropertyDescriptor(copy, '__proto__')?.value as typeof value
      assert.notEqual(copiedValue, value)
      assert.ok(!('injected' in copy))
      assert.ok(!_.has(Object.prototype, 'injected'))
      copiedValue.injected = 2
      assert.equal(value.injected, 1)
    })
  })
  it('should merge', () => {
    const a = { a: 'taco', b: { a: 'burrito', b: 'combo' }, c: [20] }
    const b = { a: 'churro', b: { c: 'platter' }, d: { f: 123 } }
    const c = _.merge(a, b)
    assert.deepEqual(c, { a: 'churro', b: { a: 'burrito', b: 'combo', c: 'platter' }, c: [20], d: { f: 123 } })
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
    assert.ok(!_.deepEqualJSONType(new Number(4), new Number(4))) // eslint-disable-line
    assert.ok(_.deepEqualJSONType('asdf', 'asdf'))
    assert.ok(!_.deepEqualJSONType(new String('asdf'), new String('asdf'))) // eslint-disable-line
    assert.ok(_.deepEqualJSONType({ a: 5, b: ['adsf'] }, { b: ['adsf'], a: 5 }))
    assert.ok(!_.deepEqualJSONType({ a: 5, b: ['adsf', {}] }, { b: ['adsf'], a: 5 }))
    assert.ok(!_.deepEqualJSONType({}, { foo: 1 }))
    assert.ok(!_.deepEqualJSONType({ foo: 1 }, {}))
    assert.ok(!_.deepEqualJSONType({ a: 1 }, { a: 1, b: 2 }))
    assert.ok(_.deepEqualJSONType(NaN, NaN))
    assert.ok(!_.deepEqualJSONType(NaN, 4))
    const sparse = [1, null, 3]
    delete sparse[1]
    assert.ok(_.deepEqualJSONType(sparse, [1, null, 3]))
    assert.ok(!_.deepEqualJSONType([undefined], [null]))
    assert.ok(!_.deepEqualJSONType({ a: undefined }, {}))
  })
  it('merge does not pollute Object prototype', () => {
    const vector = JSON.parse('{"__proto__":{"injected":1}}')
    const target = {}
    const poulluted: Record<PropertyKey, unknown> = {}
    _.merge(target, vector)
    assert.ok(typeof poulluted.injected === 'undefined')
    assert.deepEqual(target, { ['__proto__']: { injected: 1 } })
  })
})
