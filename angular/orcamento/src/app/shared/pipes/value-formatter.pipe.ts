import { Pipe, PipeTransform } from '@angular/core';
import { isArray, isFunction, isString } from 'lodash-es';

@Pipe({ name: 'valueFormatter' })
export class ValueFormatterPipe implements PipeTransform {
  transform<T extends Record<any, any>, K extends keyof T>(value: T, key: K): T[K];
  transform<T = any, K extends keyof T = any>(value: T, keys: K[]): string;
  transform<T = any, U = any>(value: T, callback: (value: T) => U): U;
  transform<T = any, U = any>(value: T, predicate: ((value: T) => U) | string | string[], separator?: string): U {
    if (!predicate) {
      return value as any;
    }
    if (isFunction(predicate)) {
      return predicate(value);
    } else if (isString(predicate)) {
      return value[predicate];
    } else if (isArray(predicate)) {
      return predicate.map(key => value?.[key] ?? '').join(separator ?? ' ') as any;
    }
    return value as any;
  }
}
