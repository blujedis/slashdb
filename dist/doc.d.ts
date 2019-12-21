import { Collection } from './collection';
export declare class Doc {
    path: string;
    private parent;
    constructor(path: string, parent: Collection);
    get(): import("./types").IMap<{}>;
    collection(key: string): Collection;
}
