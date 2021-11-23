import { Pipe, PipeTransform } from '@angular/core';
import { isArray } from 'lodash-es';

@Pipe({ name: 'reduceTo' })
export class ReduceToPipe implements PipeTransform {
  transform<T, K extends keyof T>(value: T[], key: K): T[K] extends any[] ? T[K] : T[K][] {
    if (!value?.length || !key) {
      return null;
    }
    if (isArray(value[0]?.[key])) {
      // @ts-ignore
      return value.reduce((acc, item) => [...acc, ...(item?.[key] ?? [])], []);
    } else {
      // @ts-ignore
      return value.map(val => val?.[key]);
    }
  }
}
