/**
 * Configures a promise normalizing returning and object with error and data.
 *
 * @param promise the promise to be normalized.
 */
export declare function promise<T, E = Error>(promise: Promise<T>): Promise<{
    err: any;
    data: T;
} | {
    err: E;
    data: T;
}>;
/**
 * Wraps a function expecting a callback as a promise.
 *
 * @param fn the function to be wrapped as a promise.
 */
export declare function toPromise<T>(fn: Function): (...args: any[]) => Promise<T>;
/**
 * Safely parses JSON, returns null if invalid.
 *
 * @param data the data to be parsed.
 */
export declare function tryParseJSON(data: unknown): any;
/**
 * Merge a target and source object.
 *
 * @param target the target to merge source into.
 * @param source the source to merge with target.
 */
export declare function merge(target: object, source: object): object;
/**
 * Deep merge objects.
 *
 * @param sources the objects to be merged.
 */
export declare function deepMerge(target: object, ...sources: object[]): object;
/**
 * Async for each helper.
 *
 * @param arr the array to be iterated.
 * @param cb the callback between iterations.
 */
export declare function asyncForEach(arr: any, cb: any): Promise<void>;
/**
 * Ensures both value and compare are of the same type.
 *
 * @param value the value to inspect.
 * @param compare the compare value to inspect.
 */
export declare function isMatchType(value: unknown, compare: unknown): boolean;
/**
 * Normalizes path ensuring prefix is stripped and is unix type path.
 * Also converts dot notation path to unix type path.
 *
 * @param path the value to be normalized.
 */
export declare function normalizePath(path: string): string;
/**
 * Parses a document path.
 *
 * @param path the path to be parsed.
 * @param collection optional name of the collection to be removed from path.
 */
export declare function parsePath(path: string, collection?: string | string[] | true): {
    segments: string[];
    path: string;
    namespace: string;
    collection: string;
};
