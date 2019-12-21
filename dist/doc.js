"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collection_1 = require("./collection");
const utils_1 = require("./utils");
class Doc {
    constructor(path, parent) {
        this.path = path;
        this.parent = parent;
    }
    get() {
        const snapshot = this.parent.snapshot();
        return snapshot[this.path];
    }
    collection(key) {
        const segments = utils_1.normalizePath(key).split('/');
        if (segments.length > 1)
            return null;
        return new collection_1.Collection(this.path + '.' + segments[0], this.parent.db);
    }
}
exports.Doc = Doc;
//# sourceMappingURL=doc.js.map