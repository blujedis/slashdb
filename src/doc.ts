import { Collection } from './collection';
import { Value } from './types';
import { normalizePath } from './utils';

export class Doc {

  constructor(public path: string, private parent: Collection) {
     
  }

  get() {
    const snapshot = this.parent.snapshot();
    return snapshot[this.path];
  }

  collection(key: string) {
    const segments = normalizePath(key).split('/');
    if (segments.length > 1)
      return null;
    return new Collection(this.path + '.' + segments[0], this.parent.db);
  }


}