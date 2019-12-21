import { Db } from './db';
import { IChain, Operator } from './types';
import { Doc } from './doc';
export declare class Collection {
    path: string;
    db: Db;
    constructor(path: string, db: Db);
    /**
     * Checks is is match to provided comparison.
     *
     * @param row the row object to be evaluated.
     * @param key the key in the row to evaluate value for.
     * @param operator the operator use for compare.
     * @param value the value used to compare against source.
     */
    private isMatch;
    private chain;
    /**
     * Gets a snapshot of the collection.
     */
    snapshot(): import("./types").IMap<import("./types").IMap<{}>>;
    doc(key: string): Doc;
    where(key: string, operator: Operator, value: string | boolean | number): IChain<any>;
}
