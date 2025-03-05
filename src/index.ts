// manually implemented lodash functions are better than even:
// https://github.com/lodash/babel-plugin-lodash
// additional tiny versions of lodash functions are available in VueScript2

export function mapValues <T, U> (
  obj: T,
  fn: (obj: T[keyof T]) => U,
  o: Partial<Record<keyof T, U>> = {}
): Record<keyof T, U> {
  for (const key in obj) { o[key] = fn(obj[key]) }
  return o as Record<keyof T, U>
}

export function mapObject <T, U> (
  obj: { [s: string]: T; } | ArrayLike<T>,
  fn: (value: [string, T], index: number, array: [string, T][]) => [string, U]
): { [s: string]: U; } {
  return Object.fromEntries(Object.entries(obj).map(fn))
}

export function pick <T, K extends PropertyKey> (o: T, props: K[]): PropertyKey extends K ? Partial<T> : Pick<T, Extract<K, keyof T>> {
  const x: PropertyKey extends K ? Partial<T> : Pick<T, Extract<K, keyof T>> = Object.create(null)
  for (const k of props) {
    if (has(o, k)) {
      x[k] = o[k]
    }
  }
  return x
}

export function pickWhere <T> (o: T, where: (v: T[keyof T]) => boolean): Partial<T> {
  const x: Partial<T> = Object.create(null)
  for (const k in o) {
    if (where(o[k])) { x[k] = o[k] }
  }
  return x
}

export function choose <T> (array: ArrayLike<T>, indices: Iterable<number>): T[] {
  const x: T[] = []
  for (const idx of indices) { x.push(array[idx]) }
  return x
}

export function omit <T, K extends PropertyKey> (o: T, props: K[]): PropertyKey extends K ? Partial<T> : Omit<T, Extract<K, keyof T>> {
  const x = Object.create(null)
  for (const k in o) {
    if (!props.includes(k as unknown as K)) {
      x[k] = o[k]
    }
  }
  return x
}

export function cloneDeep <T> (obj: T): ReturnType<typeof JSON.parse> {
  return JSON.parse(JSON.stringify(obj))
}

function isMergeableObject <T> (val: T): boolean {
  const nonNullObject = val && typeof val === 'object'
  return (
    nonNullObject &&
    Object.prototype.toString.call(val) !== '[object RegExp]' &&
    Object.prototype.toString.call(val) !== '[object Date]'
  )
}

export function merge <T extends object, U extends object> (obj: T, src: U): T & U {
  const res = obj as T & U
  for (const key in src) {
    const clone = isMergeableObject(src[key]) ? cloneDeep(src[key]) : undefined
    let x: (T & U)[Extract<keyof U, string>]
    if (clone && isMergeableObject((x = res[key]))) {
      merge(x as object, clone)
      continue
    }
    res[key] = clone || src[key]
  }
  return res
}

export function delay (msec: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, msec)
  })
}

export function randomBytes (length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

export function randomHexString (length: number): string {
  return Array.from(randomBytes(length), byte => (byte % 16).toString(16)).join('')
}

export function normalizeString (str: string): string {
  return str
    // [1]. Normalize strings by replacing intial and final punctuation marks,
    // which typically are used in smart quote substitution, with a standad
    // character
    // (reference issue: https://github.com/okTurtles/group-income/issues/2479)
    .replace(/[\p{Pf}\p{Pi}]/gu, "'")
    // [2]. Normalize the string based on 'Canonical equivalence'. eg) 'Amélie' !== 'Amélie' even when they are visually identical because their unicode sequences are different.
    //      (reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize#canonical_equivalence_normalization)
    .normalize('NFC')
}

export function randomIntFromRange (min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomFromArray <T> (arr: ArrayLike<T>): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function linearScale (
  [d1, d2]: [number, number],
  [r1, r2]: [number, number]
): (value: number) => number {
  // generate a function that takes a value between d1 and d2 and then
  // returns a linearly-scaled output whose min and max values are r1 and r2 respectively.
  const [dSpan, rSpan] = [d2 - d1, r2 - r1]
  return function (value: number) {
    if (value <= d1) {
      return r1
    } else if (value >= d2) {
      return r2
    } else {
      const percent = (value - d1) / dSpan
      return r1 + rSpan * percent
    }
  }
}

export function flatten <T> (arr: Array<T>): T[] {
  let flat: T[] = []
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      flat = flat.concat(arr[i])
    } else {
      flat.push(arr[i])
    }
  }
  return flat
}

export function zip <T> (...arr: T[][]): T[][] {
  const zipped: T[][] = []
  let max = 0
  arr.forEach((current) => (max = Math.max(max, current.length)))
  for (const current of arr) {
    for (let i = 0; i < max; i++) {
      zipped[i] = zipped[i] || []
      zipped[i].push(current[i])
    }
  }
  return zipped
}

export function uniq <T> (array: T[]): T[] {
  return Array.from(new Set(array))
}

export function union <T> (...arrays: T[][]): T[] {
  return uniq(Array.prototype.concat.apply([], arrays))
}

export function intersection <T> (a1: T[], ...arrays: T[][]): T[] {
  return uniq(a1).filter(v1 => arrays.every(v2 => v2.indexOf(v1) >= 0))
}

export function difference <T> (a1: T[], ...arrays: T[][]): T[] {
  const a2 = Array.prototype.concat.apply([], arrays)
  return a1.filter(v => a2.indexOf(v) === -1)
}

export function deepEqualJSONType (a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null || typeof (a) !== typeof (b)) return false
  if (typeof a !== 'object') return a === b
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
  } else if (a.constructor.name !== 'Object') {
    throw new Error(`not JSON type: ${a}`)
  }
  for (const key in a) {
    if (!deepEqualJSONType(
      a[(key as unknown as keyof typeof a)],
      b[(key as unknown as keyof typeof b)])
    ) return false
  }
  return true
}

export function hashableRepresentation (unsorted: unknown): unknown {
  if (!unsorted || typeof unsorted !== 'object') {
    return unsorted
  }
  if (Array.isArray(unsorted)) {
    return unsorted.map(v => hashableRepresentation(v))
  } else {
    return Object.keys(unsorted).sort().reduce((acc: [string, unknown][], curKey) => {
      acc.push([
        curKey,
        hashableRepresentation(unsorted[curKey as unknown as keyof typeof unsorted])
      ])
      return acc
    }, [])
  }
}

/**
 * Modified version of: https://github.com/component/debounce/blob/master/index.js
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear'
 * that is a function which will clear the timer to prevent previously scheduled executions.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param func function to wrap
 * @param wait timeout in ms (`100`)
 * @param immediate whether to execute at the beginning (`false`)
 * @api public
 */
export function debounce <A, R, C> (
  func: (...args: A[]) => R,
  wait: number,
  immediate?: boolean | null | undefined
) : {
  (...args: A[]): R;
  clear(): void;
  flush(): void;
} {
  let timeout: ReturnType<typeof setTimeout> | undefined,
    args: A[],
    context: C,
    timestamp: number,
    result: R

  if (wait == null) wait = 100

  function later () {
    const last = performance.now() - timestamp

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = undefined
      if (!immediate) {
        result = func.apply(context, args)
        args = undefined as unknown as typeof args
        context = undefined as unknown as typeof context
      }
    }
  }

  const debounced = function (this: C, ...args_: A[]) {
    args = args_
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    context = this
    timestamp = performance.now()
    const callNow = immediate && !timeout
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      args = undefined as unknown as typeof args
      context = undefined as unknown as typeof context
    }

    return result
  }

  debounced.clear = function () {
    if (timeout) {
      clearTimeout(timeout)
      timeout = undefined
    }
  }

  debounced.flush = function () {
    if (timeout) {
      result = func.apply(context, args)
      args = undefined as unknown as typeof args
      context = undefined as unknown as typeof context
      clearTimeout(timeout)
      timeout = undefined
    }
  }

  return debounced
}

export function throttle <A, R> (func: (...args: A[]) => R, delay: number): (...args: A[]) => R | undefined {
  // reference: https://www.geeksforgeeks.org/javascript-throttling/

  // Previously called time of the function
  let prev = 0
  return (...args) => {
    // Current called time of the function
    const now = new Date().getTime()

    // If difference is greater than delay call
    if (now - prev > delay) {
      prev = now

      return func(...args)
    }
  }
}

/**
 * Gets the value at `path` of `obj`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 */
export function get <T extends object, K extends PropertyKey> (obj: T, path: K[], defaultValue: unknown): unknown {
  if (!path.length) {
    return obj
  } else if (obj == null) {
    return defaultValue
  }

  let result: unknown = obj
  let i = 0
  while (result && i < path.length) {
    result = result[path[i] as unknown as keyof typeof result]
    i++
  }

  return result === undefined ? defaultValue : result
}

type THas = (o: unknown, v: PropertyKey) => v is keyof typeof o
export const has = Function.prototype.call.bind(Object.prototype.hasOwnProperty) as unknown as THas
