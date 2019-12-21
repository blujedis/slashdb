"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const collection_1 = require("./collection");
const lodash_get_1 = __importDefault(require("lodash.get"));
const lodash_set_1 = __importDefault(require("lodash.set"));
const types_1 = require("./types");
const utils_1 = require("./utils");
const doc_1 = require("./doc");
const events_1 = require("events");
const DEFAULTS = {
    [types_1.__metadata__]: {
        collections: []
    }
};
class Db extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.data = { [types_1.__metadata__]: { collections: [] } };
        this.init(options);
    }
    init({ data, stream }) {
        this.data = { ...DEFAULTS, ...data };
        this.stream = stream;
    }
    /**
     * Checks if the path is at a Collection.
     *
     * @param path the path to inspect.
     */
    isCollection(path) {
        path = utils_1.normalizePath(path);
        return this.data[types_1.__metadata__].collections.includes(path);
    }
    /**
     * Traverses namespace ensuring correct metadata at each node in path.
     *
     * @param path the path to traverse.
     * @param isCollection whether first node is Collection or not.
     */
    isValidNamespace(path, isCollection = true) {
        path = utils_1.normalizePath(path);
        const segments = path.split('/');
        let namespace = '';
        let parent = namespace;
        let valid = true;
        while (segments.length) {
            namespace = namespace.length ? namespace + '/' + segments.shift() : segments.shift();
            const isParentCollection = parent.length ? this.isCollection(parent) : false;
            const val = lodash_get_1.default(this.data, namespace.replace(/\/g/, '.'));
            // Collections can't contain collections.
            if (isCollection && isParentCollection) {
                valid = false;
                break;
            }
            if (isCollection && !this.data[types_1.__metadata__].collections.includes(namespace))
                this.data[types_1.__metadata__].collections.push(namespace);
            isCollection = !isCollection;
            parent = namespace;
        }
        if (!valid)
            return false;
        lodash_set_1.default(this.data, path, {});
        return true;
    }
    /**
     * Gets a Document or Collection at the specified path if it exists.
     *
     * @param path the path to get Document or Collection at.
     */
    get(path) {
        path = utils_1.parsePath(path).namespace;
        const obj = lodash_get_1.default(this.data, path);
        if (!obj || Array.isArray(obj) || typeof obj !== 'object')
            return null;
        return obj;
    }
    /**
     * Checks if Collection or Document exists.
     *
     * @param path the name/path of the Collection/Document.
     */
    has(path) {
        return !!this.get(path);
    }
    /**
     * Gets the collection by index name.
     *
     * @param path the name of the collection.
     */
    collection(path) {
        path = utils_1.normalizePath(path);
        return new collection_1.Collection(path, this);
    }
    /**
     * Gets a document at the specified path.
     *
     * @param path the reference path to return doc at.
     */
    doc(path) {
        if (!this.isValidNamespace(path))
            return null;
        const segments = utils_1.normalizePath(path).split('/');
        const key = segments[segments.length - 1];
        const collection = new collection_1.Collection(segments.slice(0, segments.length - 1).join('/'), this);
        return new doc_1.Doc(key, collection);
    }
    close() {
        if (this.stream)
            this.stream.close();
    }
}
exports.Db = Db;
//# sourceMappingURL=db.js.map