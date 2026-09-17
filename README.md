# turtledash

Tiny, efficient, TypeScript utility functions inspired by Lodash.

## Installation

```bash
npm install turtledash
```

## Features

turtledash provides a collection of utility functions for working with objects, arrays, and more:

- Lightweight implementation of common utility functions
- Fully typed with TypeScript
- Zero dependencies
- MIT licensed

## API Reference

### Object Functions

#### `mapValues<T, U>(obj, fn, [o])`
Maps the values of an object to create a new object with the same keys.

```ts
const users = { 'fred': { 'age': 40 }, 'pebbles': { 'age': 1 } };
mapValues(users, user => user.age); // { 'fred': 40, 'pebbles': 1 }
```

#### `mapObject<T, U>(obj, fn)`
Maps an object's entries and returns a new object.

#### `pick<T, K>(o, props)`
Creates an object composed of the picked object properties.

#### `pickWhere<T>(o, where)`
Creates an object with properties that satisfy the provided predicate function.

#### `omit<T, K>(o, props)`
Creates an object composed of properties not included in the provided array.

#### `cloneDeep<T>(obj)`
Creates a deep clone of the value using `JSON.parse(JSON.stringify(obj))`. Use
this only for JSON-compatible values because `undefined`, functions, `Date`,
`Map`, `Set`, symbols, and other richer values can be lost or changed. Use
`cloneValue` when those values must be preserved.

#### `cloneValue<T>(v)`
Recursively clones arrays and plain objects without JSON serialization. Plain
objects retain their `Object.prototype` or `null` prototype, and only their own
enumerable string-keyed properties are copied. Explicit `undefined` values are
preserved, including object properties and array elements. Sparse-array holes
become `null`, producing a dense array; additional array properties are not copied.

Primitives are returned unchanged. Functions and non-plain objects, including
`Date`, `Map`, `Set`, and class instances, are returned by reference, even when
nested. As a limitation, array subclasses are normalized to plain arrays, so
their custom prototypes and methods are not retained. Literal `__proto__` keys
are copied safely without changing the clone's prototype. Circular references
through arrays or plain objects are not supported.

```ts
const original = { items: [{ count: 1 }], optional: undefined };
const copy = cloneValue(original);
copy.items[0].count = 2;
original.items[0].count; // 1
has(copy, 'optional'); // true

cloneValue(new Array(2)); // [null, null]
cloneValue([undefined]); // [undefined]
```

#### `safeDefine(obj, key, value)`
Defines or replaces an own data property on `obj` with `writable`, `enumerable`,
and `configurable` all set to `true`. Mutates `obj` and returns `undefined`.
Setters are not invoked, so a literal `__proto__` key can be stored without
changing the object's prototype. Also works with null-prototype objects.
Like `Object.defineProperty`, it throws if the property cannot be defined, such
as when adding a key to a non-extensible object or replacing a non-configurable
property. The value is stored as-is, without cloning.

```ts
const target = {};
safeDefine(target, '__proto__', { value: 1 });
Object.getPrototypeOf(target) === Object.prototype; // true
has(target, '__proto__'); // true
```

#### `merge<T, U>(obj, src)`
Recursively merges own properties of the source object into the target object.

#### `get<T, K>(obj, path, defaultValue)`
Gets the value at path of object. If the resolved value is undefined, the defaultValue is returned.

### Array Functions

#### `choose<T>(array, indices)`
Creates an array of elements selected from the original array at the specified indices.

#### `flatten<T>(arr)`
Flattens an array a single level deep.

#### `zip<T>(...arr)`
Creates an array of grouped elements.

#### `uniq<T>(array)`
Creates an array of unique values.

#### `union<T>(...arrays)`
Creates an array of unique values from all given arrays.

#### `intersection<T>(a1, ...arrays)`
Creates an array of unique values that are included in all given arrays.

#### `difference<T>(a1, ...arrays)`
Creates an array of values from the first array that are not included in the other arrays.

### Other Utility Functions

#### `delay(msec)`
Returns a Promise that resolves after the specified number of milliseconds.

#### `randomBytes(length)`
Generates cryptographically strong random bytes.

#### `randomHexString(length)`
Generates a random hex string.

#### `normalizeString(str)`
Normalizes strings by replacing punctuation marks and applying unicode normalization.

#### `randomIntFromRange(min, max)`
Generates a random integer between min and max, inclusive.

#### `randomFromArray<T>(arr)`
Returns a random element from an array.

#### `linearScale([d1, d2], [r1, r2])`
Creates a function that linearly scales a value from one range to another.

#### `deepEqualJSONType(a, b)`
Performs a deep equality check tailored to JSON-compatible values. Property
order is ignored, `NaN` equals `NaN`, sparse-array holes compare as `null`,
`undefined` is never equal to any other value, and non-plain objects such as
`Date` and class instances are compared by reference instead of throwing.

#### `isPlainObject(v)`
Returns `true` for objects whose prototype is `Object.prototype` or `null`.
Arrays and `null` return `false`.

#### `readJSONIndex(arr, i)`
Reads `arr[i]`, reporting a sparse-array hole as `null`, mirroring
`JSON.stringify`.

#### `hashableRepresentation(unsorted)`
Creates a consistently sortable representation of an object for hashing purposes.

#### `debounce<A, R, C>(func, wait, immediate)`
Creates a debounced function that delays invoking the provided function.

#### `throttle<A, R>(func, delay)`
Creates a throttled function that only invokes the provided function at most once per specified interval.

#### `has(obj, key)`
Returns `true` when `obj` has `key` as an own property.

## Examples

```ts
import {
  mapValues,
  pick,
  debounce,
  randomIntFromRange,
  has
} from 'turtledash';

// Transform all values in an object
const users = { 'fred': { 'age': 40 }, 'pebbles': { 'age': 1 } };
const ages = mapValues(users, user => user.age);
// { 'fred': 40, 'pebbles': 1 }

// Pick specific properties from an object
const user = { id: 1, name: 'John', email: 'john@example.com', role: 'admin' };
const credentials = pick(user, ['name', 'email']);
// { name: 'John', email: 'john@example.com' }

// Create a debounced function
const saveChanges = debounce(() => {
  // Save data to server
  console.log('Saving changes...');
}, 500);

// Generate a random number in a range
const randomValue = randomIntFromRange(1, 100);
```

## License

MIT License
