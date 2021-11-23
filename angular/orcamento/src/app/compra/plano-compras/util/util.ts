import { isPlainObject } from 'lodash-es';
import { map } from 'rxjs/operators';

export const setUndefinedToZeroObj = <T>() =>
  map<T, T>(obj => {
    if (!obj || !isPlainObject(obj)) {
      return obj;
    }
    return Object.keys(obj).reduce((newObj, key) => {
      return { ...newObj, [key]: obj[key] ?? 0 };
    }, {}) as T;
  });
