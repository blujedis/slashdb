/// <reference types="node" />
import { Collection } from './collection';
import { WriteStream } from 'fs';
import { IDbOptions, IDb } from './types';
import { Doc } from './doc';
import { EventEmitter } from 'events';
export declare class Db extends EventEmitter {
    name: string;
    stream: WriteStream;
    data: IDb;
    constructor(options?: IDbOptions);
    private init;
    /**
     * Checks if the path is at a Collection.
     *
     * @param path the path to inspect.
     */
    private isCollection;
    /**
     * Traverses namespace ensuring correct metadata at each node in path.
     *
     * @param path the path to traverse.
     * @param isCollection whether first node is Collection or not.
     */
    isValidNamespace(path: string, isCollection?: boolean): boolean;
    /**
     * Gets a Document or Collection at the specified path if it exists.
     *
     * @param path the path to get Document or Collection at.
     */
    get(path: string): object;
    /**
     * Checks if Collection or Document exists.
     *
     * @param path the name/path of the Collection/Document.
     */
    has(path: string): boolean;
    /**
     * Gets the collection by index name.
     *
     * @param path the name of the collection.
     */
    collection(path: string): Collection;
    /**
     * Gets a document at the specified path.
     *
     * @param path the reference path to return doc at.
     */
    doc(path: string): Doc;
    close(): void;
}
