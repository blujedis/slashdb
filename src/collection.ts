import { Db } from './db';
import isEqual from 'lodash.isequal';
import getData from 'lodash.get';
import setData from 'lodash.set';
import { isMatchType, normalizePath } from './utils';
import { IChain, Operator, Value, __metadata__ } from './types';
import { Doc } from './doc';

export class Collection {

  constructor(public path: string, public db: Db) {
    const meta = this.db.data[__metadata__];
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
  private isMatch<T = any>(row: T, key: string, operator: Operator, value: Value) {

    const current = row[key];
    const isArray = Array.isArray(current);

    if (!isMatchType(current, value))
      return false;

    const reqArray = ['in', 'not'];

    if (reqArray.some(v => v === operator) && !Array.isArray(value))
      throw new Error(`Operator "in" requires compare value of Array but got type of ${typeof value}`);

    if (operator === 'in') {
      if (!isArray)
        return (value as any).some(v => current === v);
      return (value as any).some(v => {
        return current.some(c => v === c);
      });
    }

    if (operator === 'not') {
      if (!isArray)
        return !(value as any).some(v => current === v);
      return !(value as any).some(v => {
        return current.some(c => v === c);
      });
    }

    if (operator === '==') {
      if (isArray && !Array.isArray(value))
        throw new Error(`Attempted equality operator but source and compare values are not of same type did you mean to use "in"?`);
      return isEqual(current, value);
    }

    if (operator === '!=') {
      if (isArray && !Array.isArray(value))
        throw new Error(`Attempted none equality operator but source and compare values are not of same type did you mean to use "not"?`);
      return !isEqual(current, value);
    }

    if (operator === '>') {
      if (isArray)
        return (current.length > (value as any).length);
      if (typeof current === 'string')
        return (current.length > (value as string).length);
      return current > value;
    }

    if (operator === '<') {
      if (isArray)
        return (current.length < (value as any).length);
      if (typeof current === 'string')
        return (current.length < (value as string).length);
      return current < value;
    }

    if (operator === '>=') {
      if (isArray)
        return (current.length >= (value as any).length);
      if (typeof current === 'string')
        return (current.length >= (value as string).length);
      return current >= value;
    }

    if (operator === '<=') {
      if (isArray)
        return (current.length <= (value as any).length);
      if (typeof current === 'string')
        return (current.length <= (value as string).length);
      return current <= value;
    }

    return false;

  }

  private chain<T = any>(chain?: IChain<T>, isOr: boolean = false) {

    let _data = [] as T[];

    chain = chain || {
      get: () => _data,
      and: this.chain(chain),
      or: this.chain(chain, true)
    };

    return (key: string, operator: Operator, value: Value) => {

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
    return getData(this.db.data, this.path) || {};
  }

  doc(key: string) {
    const segments = normalizePath(key).split('/');
    if (segments.length > 1)
      return null;
    return new Doc(this.path + '.' + segments[0], this);
  }

  where(key: string, operator: Operator, value: string | boolean | number) {
    return this.chain()(key, operator, value);
  }

}
