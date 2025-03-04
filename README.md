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
Creates a deep clone of the value.

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
Performs a deep equality check on JSON-compatible objects.

#### `hashableRepresentation(unsorted)`
Creates a consistently sortable representation of an object for hashing purposes.

#### `debounce<A, R, C>(func, wait, immediate)`
Creates a debounced function that delays invoking the provided function.

#### `throttle<A, R>(func, delay)`
Creates a throttled function that only invokes the provided function at most once per specified interval.

## Examples

```ts
import { 
  mapValues, 
  pick, 
  debounce, 
  randomIntFromRange 
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
