// manually implemented lodash functions are better than even:
// https://github.com/lodash/babel-plugin-lodash
// additional tiny versions of lodash functions are available in VueScript2
export function mapValues(obj, fn, o = {}) {
    for (const key in obj) {
        o[key] = fn(obj[key]);
    }
    return o;
}
export function mapObject(obj, fn) {
    return Object.fromEntries(Object.entries(obj).map(fn));
}
export function pick(o, props) {
    const x = Object.create(null);
    for (const k of props) {
        x[k] = o[k];
    }
    return x;
}
export function pickWhere(o, where) {
    const x = Object.create(null);
    for (const k in o) {
        if (where(o[k])) {
            x[k] = o[k];
        }
    }
    return x;
}
export function choose(array, indices) {
    const x = [];
    for (const idx of indices) {
        x.push(array[idx]);
    }
    return x;
}
export function omit(o, props) {
    const x = Object.create(null);
    for (const k in o) {
        if (!props.includes(k)) {
            x[k] = o[k];
        }
    }
    return x;
}
export function cloneDeep(obj) {
    return JSON.parse(JSON.stringify(obj));
}
function isMergeableObject(val) {
    const nonNullObject = val && typeof val === 'object';
    return (nonNullObject &&
        Object.prototype.toString.call(val) !== '[object RegExp]' &&
        Object.prototype.toString.call(val) !== '[object Date]');
}
export function merge(obj, src) {
    const res = obj;
    for (const key in src) {
        const clone = isMergeableObject(src[key]) ? cloneDeep(src[key]) : undefined;
        const x = res[key];
        if (clone && x && isMergeableObject(x)) {
            merge(x, clone);
            continue;
        }
        res[key] = clone || src[key];
    }
    return res;
}
export function delay(msec) {
    return new Promise((resolve) => {
        setTimeout(resolve, msec);
    });
}
export function randomBytes(length) {
    return crypto.getRandomValues(new Uint8Array(length));
}
export function randomHexString(length) {
    return Array.from(randomBytes(length), byte => (byte % 16).toString(16)).join('');
}
export function normalizeString(str) {
    return str
        // [1]. Normalize strings by replacing intial and final punctuation marks,
        // which typically are used in smart quote substitution, with a standad
        // character
        // (reference issue: https://github.com/okTurtles/group-income/issues/2479)
        .replace(/[\p{Pf}\p{Pi}]/gu, "'")
        // [2]. Normalize the string based on 'Canonical equivalence'. eg) 'Amélie' !== 'Amélie' even when they are visually identical because their unicode sequences are different.
        //      (reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize#canonical_equivalence_normalization)
        .normalize('NFC');
}
export function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
export function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
export function linearScale([d1, d2], [r1, r2]) {
    // generate a function that takes a value between d1 and d2 and then
    // returns a linearly-scaled output whose min and max values are r1 and r2 respectively.
    const [dSpan, rSpan] = [d2 - d1, r2 - r1];
    return function (value) {
        if (value <= d1) {
            return r1;
        }
        else if (value >= d2) {
            return r2;
        }
        else {
            const percent = (value - d1) / dSpan;
            return r1 + rSpan * percent;
        }
    };
}
export function flatten(arr) {
    let flat = [];
    for (let i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i])) {
            flat = flat.concat(arr[i]);
        }
        else {
            flat.push(arr[i]);
        }
    }
    return flat;
}
export function zip(...arr) {
    const zipped = [];
    let max = 0;
    arr.forEach((current) => (max = Math.max(max, current.length)));
    for (const current of arr) {
        for (let i = 0; i < max; i++) {
            zipped[i] = zipped[i] || [];
            zipped[i].push(current[i]);
        }
    }
    return zipped;
}
export function uniq(array) {
    return Array.from(new Set(array));
}
export function union(...arrays) {
    return uniq(Array.prototype.concat.apply([], arrays));
}
export function intersection(a1, ...arrays) {
    return uniq(a1).filter(v1 => arrays.every(v2 => v2.indexOf(v1) >= 0));
}
export function difference(a1, ...arrays) {
    const a2 = Array.prototype.concat.apply([], arrays);
    return a1.filter(v => a2.indexOf(v) === -1);
}
export function deepEqualJSONType(a, b) {
    if (a === b)
        return true;
    if (a == null || b == null || typeof (a) !== typeof (b))
        return false;
    if (typeof a !== 'object')
        return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length)
            return false;
    }
    else if (a.constructor.name !== 'Object') {
        throw new Error(`not JSON type: ${a}`);
    }
    for (const key in a) {
        if (!deepEqualJSONType(a[key], b[key]))
            return false;
    }
    return true;
}
export function hashableRepresentation(unsorted) {
    if (!unsorted || typeof unsorted !== 'object') {
        return unsorted;
    }
    if (Array.isArray(unsorted)) {
        return unsorted.map(v => hashableRepresentation(v));
    }
    else {
        return Object.keys(unsorted).sort().reduce((acc, curKey) => {
            acc.push([
                curKey,
                hashableRepresentation(unsorted[curKey])
            ]);
            return acc;
        }, []);
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
export function debounce(func, wait, immediate) {
    let timeout, args, context, timestamp, result;
    if (wait == null)
        wait = 100;
    function later() {
        const last = performance.now() - timestamp;
        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        }
        else {
            timeout = undefined;
            if (!immediate) {
                result = func.apply(context, args);
                args = undefined;
                context = undefined;
            }
        }
    }
    const debounced = function (...args_) {
        args = args_;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        context = this;
        timestamp = performance.now();
        const callNow = immediate && !timeout;
        if (!timeout)
            timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            args = undefined;
            context = undefined;
        }
        return result;
    };
    debounced.clear = function () {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
    };
    debounced.flush = function () {
        if (timeout) {
            result = func.apply(context, args);
            args = undefined;
            context = undefined;
            clearTimeout(timeout);
            timeout = undefined;
        }
    };
    return debounced;
}
export function throttle(func, delay) {
    // reference: https://www.geeksforgeeks.org/javascript-throttling/
    // Previously called time of the function
    let prev = 0;
    return (...args) => {
        // Current called time of the function
        const now = new Date().getTime();
        // If difference is greater than delay call
        if (now - prev > delay) {
            prev = now;
            return func(...args);
        }
    };
}
/**
 * Gets the value at `path` of `obj`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 */
export function get(obj, path, defaultValue) {
    if (!path.length) {
        return obj;
    }
    else if (obj == null) {
        return defaultValue;
    }
    let result = obj;
    let i = 0;
    while (result && i < path.length) {
        result = result[path[i]];
        i++;
    }
    return result === undefined ? defaultValue : result;
}
export const has = Function.prototype.call.bind(Object.prototype.hasOwnProperty);
