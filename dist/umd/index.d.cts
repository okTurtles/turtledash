export declare function mapValues<T, U>(obj: T, fn: (obj: T[keyof T]) => U, o?: Partial<Record<keyof T, U>>): Record<keyof T, U>;
export declare function mapObject<T, U>(obj: {
    [s: string]: T;
} | ArrayLike<T>, fn: (value: [string, T], index: number, array: [string, T][]) => [string, U]): {
    [s: string]: U;
};
export declare function pick<T>(o: T, props: (keyof T)[]): Partial<T>;
export declare function pickWhere<T>(o: T, where: (v: T[keyof T]) => boolean): Partial<T>;
export declare function choose<T>(array: ArrayLike<T>, indices: Iterable<number>): T[];
export declare function omit<T>(o: T, props: (keyof T)[]): Omit<T, typeof props[number]>;
export declare function cloneDeep<T>(obj: T): ReturnType<typeof JSON.parse>;
export declare function merge<T extends object, U extends object>(obj: T, src: U): T & U;
export declare function delay(msec: number): Promise<void>;
export declare function randomBytes(length: number): Uint8Array;
export declare function randomHexString(length: number): string;
export declare function normalizeString(str: string): string;
export declare function randomIntFromRange(min: number, max: number): number;
export declare function randomFromArray<T>(arr: ArrayLike<T>): T;
export declare function linearScale([d1, d2]: [number, number], [r1, r2]: [number, number]): (value: number) => number;
export declare function flatten<T>(arr: Array<T>): T[];
export declare function zip<T>(...arr: T[][]): T[][];
export declare function uniq<T>(array: T[]): T[];
export declare function union<T>(...arrays: T[][]): T[];
export declare function intersection<T>(a1: T[], ...arrays: T[][]): T[];
export declare function difference<T>(a1: T[], ...arrays: T[][]): T[];
export declare function deepEqualJSONType(a: unknown, b: unknown): boolean;
export declare function hashableRepresentation(unsorted: unknown): unknown;
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
export declare function debounce<A, R, C>(func: (...args: A[]) => R, wait: number, immediate?: boolean | null | undefined): {
    (...args: A[]): R;
    clear(): void;
    flush(): void;
};
export declare function throttle<A, R>(func: (...args: A[]) => R, delay: number): (...args: A[]) => R | undefined;
/**
 * Gets the value at `path` of `obj`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 */
export declare function get<T extends object, K extends PropertyKey>(obj: T, path: K[], defaultValue: unknown): unknown;
type THas = (o: unknown, v: PropertyKey) => v is keyof typeof o;
export declare const has: THas;
export {};
