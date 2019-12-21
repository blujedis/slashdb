"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
const lodash_get_1 = __importDefault(require("lodash.get"));
const utils_1 = require("./utils");
const types_1 = require("./types");
const doc_1 = require("./doc");
class Collection {
    constructor(path, db) {
        this.path = path;
        this.db = db;
        const meta = this.db.data[types_1.__metadata__];
        if (!meta.collections.includes(path))
            meta.collections.push(path);
    }
    /**
     * Checks is is match to provided comparison.
     *
     * @param row the row object to be evaluated.
     * @param key the key in the row to evaluate value for.
     * @param operator the operator use for compare.
     * @param value the value used to compare against source.
     */
    isMatch(row, key, operator, value) {
        const current = row[key];
        const isArray = Array.isArray(current);
        if (!utils_1.isMatchType(current, value))
            return false;
        const reqArray = ['in', 'not'];
        if (reqArray.some(v => v === operator) && !Array.isArray(value))
            throw new Error(`Operator "in" requires compare value of Array but got type of ${typeof value}`);
        if (operator === 'in') {
            if (!isArray)
                return value.some(v => current === v);
            return value.some(v => {
                return current.some(c => v === c);
            });
        }
        if (operator === 'not') {
            if (!isArray)
                return !value.some(v => current === v);
            return !value.some(v => {
                return current.some(c => v === c);
            });
        }
        if (operator === '==') {
            if (isArray && !Array.isArray(value))
                throw new Error(`Attempted equality operator but source and compare values are not of same type did you mean to use "in"?`);
            return lodash_isequal_1.default(current, value);
        }
        if (operator === '!=') {
            if (isArray && !Array.isArray(value))
                throw new Error(`Attempted none equality operator but source and compare values are not of same type did you mean to use "not"?`);
            return !lodash_isequal_1.default(current, value);
        }
        if (operator === '>') {
            if (isArray)
                return (current.length > value.length);
            if (typeof current === 'string')
                return (current.length > value.length);
            return current > value;
        }
        if (operator === '<') {
            if (isArray)
                return (current.length < value.length);
            if (typeof current === 'string')
                return (current.length < value.length);
            return current < value;
        }
        if (operator === '>=') {
            if (isArray)
                return (current.length >= value.length);
            if (typeof current === 'string')
                return (current.length >= value.length);
            return current >= value;
        }
        if (operator === '<=') {
            if (isArray)
                return (current.length <= value.length);
            if (typeof current === 'string')
                return (current.length <= value.length);
            return current <= value;
        }
        return false;
    }
    chain(chain, isOr = false) {
        let _data = [];
        chain = chain || {
            get: () => _data,
            and: this.chain(chain),
            or: this.chain(chain, true)
        };
        return (key, operator, value) => {
            const snapshot = {};
            _data = [].reduce((a, c) => {
                if (!this.isMatch(snapshot[c], key, operator, value))
                    return a;
                return [...a, snapshot[c]];
            }, []);
            return chain;
        };
    }
    /**
     * Gets a snapshot of the collection.
     */
    snapshot() {
        return lodash_get_1.default(this.db.data, this.path) || {};
    }
    doc(key) {
        const segments = utils_1.normalizePath(key).split('/');
        if (segments.length > 1)
            return null;
        return new doc_1.Doc(this.path + '.' + segments[0], this);
    }
    where(key, operator, value) {
        return this.chain()(key, operator, value);
    }
}
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map