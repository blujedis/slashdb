import { dirname } from 'path';
import { Collection } from './collection';
import getData from 'lodash.get';
import setData from 'lodash.set';
import { createWriteStream, WriteStream, existsSync, mkdirSync } from 'fs';
import { IDbOptions, __metadata__, IDb } from './types';
import { parsePath, normalizePath } from './utils';
import { Doc } from './doc';
import { EventEmitter } from 'events';

const DEFAULTS: IDb = {
  [__metadata__]: {
    collections: []
  }
};

export class Db extends EventEmitter {

  name: string;
  stream: WriteStream;
  data: IDb = { [__metadata__]: { collections: [] } };

  constructor(options: IDbOptions = {}) {
    super();
    this.init(options);
  }

  private init({ data, stream }: IDbOptions) {
    this.data = { ...DEFAULTS, ...data };
    this.stream = stream;
  }

  /**
   * Checks if the path is at a Collection.
   * 
   * @param path the path to inspect.
   */
  private isCollection(path: string) {
    path = normalizePath(path);
    return this.data[__metadata__].collections.includes(path);
  }

  /**
   * Traverses namespace ensuring correct metadata at each node in path.
   * 
   * @param path the path to traverse.
   * @param isCollection whether first node is Collection or not.
   */
  isValidNamespace(path: string, isCollection: boolean = true) {

    path = normalizePath(path);
    const segments = path.split('/');

    let namespace = '';
    let parent = namespace;
    let valid = true;

    while (segments.length) {

      namespace = namespace.length ? namespace + '/' + segments.shift() : segments.shift();

      const isParentCollection = parent.length ? this.isCollection(parent) : false;
      const val = getData(this.data, namespace.replace(/\/g/, '.'));

      // Collections can't contain collections.
      if (isCollection && isParentCollection) {
        valid = false;
        break;
      }

      if (isCollection && !this.data[__metadata__].collections.includes(namespace))
        this.data[__metadata__].collections.push(namespace);

      isCollection = !isCollection;
      parent = namespace;

    }

    if (!valid)
      return false;

    setData(this.data, path, {});
    return true;

  }

  /**
   * Gets a Document or Collection at the specified path if it exists.
   * 
   * @param path the path to get Document or Collection at.
   */
  get(path: string): object {
    path = parsePath(path).namespace;
    const obj = getData(this.data, path);
    if (!obj || Array.isArray(obj) || typeof obj !== 'object')
      return null;
    return obj;
  }

  /**
   * Checks if Collection or Document exists.
   * 
   * @param path the name/path of the Collection/Document.
   */
  has(path: string): boolean {
    return !!this.get(path);
  }

  /**
   * Gets the collection by index name.
   * 
   * @param path the name of the collection.
   */
  collection(path: string): Collection {
    path = normalizePath(path);
    return new Collection(path, this);
  }

  /**
   * Gets a document at the specified path.
   * 
   * @param path the reference path to return doc at.
   */
  doc(path: string) {

    if (!this.isValidNamespace(path))
      return null;

    const segments = normalizePath(path).split('/');
    const key = segments[segments.length - 1];
    const collection = new Collection(segments.slice(0, segments.length - 1).join('/'), this);

    return new Doc(key, collection);

  }

  close() {
    if (this.stream)
      this.stream.close();
  }

}

