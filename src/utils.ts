import slash from 'slash';

/**
 * Configures a promise normalizing returning and object with error and data.
 * 
 * @param promise the promise to be normalized.
 */
export function promise<T, E = Error>(promise: Promise<T>) {
  return promise
    .then(data => ({ err: null, data }))
    .catch(err => ({ err: err as E, data: null as T }));
}

/**
 * Wraps a function expecting a callback as a promise.
 * 
 * @param fn the function to be wrapped as a promise.
 */
export function toPromise<T>(fn: Function) {
  return (...args: any[]): Promise<T> => {
    return new Promise((resolve, reject) => {
      fn(...args, (err, data) => {
        if (err)
          return reject(err);
        resolve(data);
      });
    });
  };
}

/**
 * Safely parses JSON, returns null if invalid.
 * 
 * @param data the data to be parsed.
 */
export function tryParseJSON(data: unknown) {
  if (typeof data !== 'string')
    return null;
  try {
    return JSON.parse(data);
  }
  catch (ex) {
    return null;
  }
}

/**
 * Merge a target and source object.
 * 
 * @param target the target to merge source into.
 * @param source the source to merge with target.
 */
export function merge(target: object, source: object) {
  for (const k in source) {
    if (!source.hasOwnProperty(k)) continue;
    if (typeof source[k] === 'object' && !Array.isArray(source[k])) {
      if (typeof target[k] === 'undefined')
        target[k] = {};
      if (typeof target[k] !== 'object')
        throw new Error(`Cannot merge object at target ${k}:\n ${JSON.stringify(source[k], null, 2)}`);
      target[k] = merge(target[k], source[k]);
    }
    else {
      target[k] = source[k];
    }
  }
  return target;
}

/**
 * Deep merge objects.
 * 
 * @param sources the objects to be merged.
 */
export function deepMerge(target: object, ...sources: object[]) {
  return sources.reduce((a, c) => a = merge(a, c), target);
}

/**
 * Async for each helper.
 * 
 * @param arr the array to be iterated.
 * @param cb the callback between iterations.
 */
export async function asyncForEach(arr, cb) {
  for (let i = 0; i < arr.length; i++) {
    await cb(arr[i], i, arr);
  }
}

/**
 * Ensures both value and compare are of the same type.
 * 
 * @param value the value to inspect.
 * @param compare the compare value to inspect.
 */
export function isMatchType(value: unknown, compare: unknown) {
  const isArray = Array.isArray(value);
  if (!isArray && typeof value === 'object')
    return false;
  if (isArray)
    return Array.isArray(compare);
  return typeof value === typeof compare;
}

/**
 * Normalizes path ensuring prefix is stripped and is unix type path.
 * Also converts dot notation path to unix type path.
 * 
 * @param path the value to be normalized.
 */
export function normalizePath(path: string) {
  path = slash(path);
  return path.replace(/^\.?\//, '').replace(/\./g, '/');
}

/**
 * Parses a document path.
 * 
 * @param path the path to be parsed.
 * @param collection optional name of the collection to be removed from path.
 */
export function parsePath(path: string, collection?: string | string[] | true) {

  path = normalizePath(path);
  const segments = path.split('/');

  let _collection: string;

  if ((typeof collection === 'string' && segments[0] === collection) || (typeof collection === 'boolean') || collection.includes(segments[0]))
    _collection = segments.shift();

  path = segments.join('/');

  return {
    segments,
    path,
    namespace: segments.join('.'),
    collection: _collection
  };

}