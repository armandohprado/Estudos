import { get, isArray, isFunction, isNil, isNumber, isString } from 'lodash-es';
import { map } from 'rxjs/operators';
import { sort } from 'fast-sort';
import { MonoTypeOperatorFunction } from 'rxjs';

export type Order = 'asc' | 'desc';

export type OrderByType<T, K extends keyof T = keyof T> =
  | K[]
  | K
  | string
  | string[]
  | ((valueA: T, valueB: T) => number)
  | Partial<Record<K, Order>>;

export function orderBy<T>(array: T[], key?: keyof T, order?: Order): T[];
export function orderBy<T>(array: T[], keys?: (keyof T)[], order?: Order): T[];
export function orderBy<T>(array: T[], deepKey?: string, order?: Order): T[];
export function orderBy<T>(array: T[], deepKeys?: string[], order?: Order): T[];
export function orderBy<T>(array: T[], comparator?: (valueA: T, valueB: T) => number): T[];
export function orderBy<T, K extends keyof T>(values: T[], commands: Partial<Record<K, Order>>): T[];
export function orderBy<T>(values: T[], keyOrCommand?: OrderByType<T>, order?: Order): T[];
export function orderBy<T, K extends keyof T>(values: T[], keyOrCommand?: OrderByType<T>, order: Order = 'asc'): T[] {
  if (!values?.length || (!order && !keyOrCommand)) {
    return values;
  }
  values = [...values];
  if (!keyOrCommand) {
    return sort(values)[order]();
  } else if (isFunction(keyOrCommand)) {
    return values.sort(keyOrCommand);
  } else if (isString(keyOrCommand)) {
    const getter = keyOrCommand.includes('.') ? get : (value: T) => (value as any)[keyOrCommand];
    return sort(values)[order](entity => getter(entity as any, keyOrCommand));
  } else if (isArray(keyOrCommand)) {
    const getter = keyOrCommand.some((key: any) => key.includes('.')) ? get : (value: T, key: K) => value[key];
    return sort(values)[order]((keyOrCommand as string[]).map(key => entity => getter(entity, key as any)));
  } else {
    return sort(values).by(
      Object.entries<Order>(keyOrCommand as Record<K, Order>).map(([key, value]) => ({
        [value]: key,
      })) as any
    );
  }
}

export function compareValues<T>(valueA: T, valueB: T): number {
  if (isNil(valueA)) return 1;
  if (isNil(valueB)) return -1;
  if (isNumber(valueA) && isNumber(valueB)) {
    return +valueA - +valueB;
  } else {
    return valueA.toString().localeCompare(valueB.toString());
  }
}

export function compareValuesKey<T>(valueA: T, valueB: T, key: keyof T | string): number {
  return compareValues(valueA?.[key as string], valueB?.[key as string]);
}

export function orderByOperator<T>(key?: keyof T, order?: Order): MonoTypeOperatorFunction<T[]>;
export function orderByOperator<T>(keys?: (keyof T)[], order?: Order): MonoTypeOperatorFunction<T[]>;
export function orderByOperator<T>(deepKey?: string, order?: Order): MonoTypeOperatorFunction<T[]>;
export function orderByOperator<T>(deepKeys?: string[], order?: Order): MonoTypeOperatorFunction<T[]>;
export function orderByOperator<T>(comparator?: (valueA: T, valueB: T) => number): MonoTypeOperatorFunction<T[]>;
export function orderByOperator<T, K extends keyof T>(commands?: Record<K, Order>): MonoTypeOperatorFunction<T[]>;
export function orderByOperator<T>(keyOrCommand?: OrderByType<T>, order: Order = 'asc'): MonoTypeOperatorFunction<T[]> {
  return map(array => orderBy(array, keyOrCommand, order));
}
