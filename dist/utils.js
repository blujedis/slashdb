"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slash_1 = __importDefault(require("slash"));
/**
 * Configures a promise normalizing returning and object with error and data.
 *
 * @param promise the promise to be normalized.
 */
function promise(promise) {
    return promise
        .then(data => ({ err: null, data }))
        .catch(err => ({ err: err, data: null }));
}
exports.promise = promise;
/**
 * Wraps a function expecting a callback as a promise.
 *
 * @param fn the function to be wrapped as a promise.
 */
function toPromise(fn) {
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn(...args, (err, data) => {
                if (err)
                    return reject(err);
                resolve(data);
            });
        });
    };
}
exports.toPromise = toPromise;
/**
 * Safely parses JSON, returns null if invalid.
 *
 * @param data the data to be parsed.
 */
function tryParseJSON(data) {
    if (typeof data !== 'string')
        return null;
    try {
        return JSON.parse(data);
    }
    catch (ex) {
        return null;
    }
}
exports.tryParseJSON = tryParseJSON;
/**
 * Merge a target and source object.
 *
 * @param target the target to merge source into.
 * @param source the source to merge with target.
 */
function merge(target, source) {
    for (const k in source) {
        if (!source.hasOwnProperty(k))
            continue;
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
exports.merge = merge;
/**
 * Deep merge objects.
 *
 * @param sources the objects to be merged.
 */
function deepMerge(target, ...sources) {
    return sources.reduce((a, c) => a = merge(a, c), target);
}
exports.deepMerge = deepMerge;
/**
 * Async for each helper.
 *
 * @param arr the array to be iterated.
 * @param cb the callback between iterations.
 */
async function asyncForEach(arr, cb) {
    for (let i = 0; i < arr.length; i++) {
        await cb(arr[i], i, arr);
    }
}
exports.asyncForEach = asyncForEach;
/**
 * Ensures both value and compare are of the same type.
 *
 * @param value the value to inspect.
 * @param compare the compare value to inspect.
 */
function isMatchType(value, compare) {
    const isArray = Array.isArray(value);
    if (!isArray && typeof value === 'object')
        return false;
    if (isArray)
        return Array.isArray(compare);
    return typeof value === typeof compare;
}
exports.isMatchType = isMatchType;
/**
 * Normalizes path ensuring prefix is stripped and is unix type path.
 * Also converts dot notation path to unix type path.
 *
 * @param path the value to be normalized.
 */
function normalizePath(path) {
    path = slash_1.default(path);
    return path.replace(/^\.?\//, '').replace(/\./g, '/');
}
exports.normalizePath = normalizePath;
/**
 * Parses a document path.
 *
 * @param path the path to be parsed.
 * @param collection optional name of the collection to be removed from path.
 */
function parsePath(path, collection) {
    path = normalizePath(path);
    const segments = path.split('/');
    let _collection;
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
exports.parsePath = parsePath;
//# sourceMappingURL=utils.js.map