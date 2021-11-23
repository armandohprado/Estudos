import { Pipe, PipeTransform } from '@angular/core';
import { AwFilterConditional, AwFilterType } from './aw-filter.type';
import { awFilter } from './aw-filter.util';
import { isArray, isNil, isNumber, isString, isSymbol } from 'lodash-es';
import { isKeyof } from '@aw-utils/string';

export interface AwFilterPipeType {
  filterType: 'conditional' | 'filter';
  type: AwFilterType;
  term?: any;
  conditional?: AwFilterConditional<any>;
}
export type AwFilterPipeProperties<T> = Partial<Record<keyof T, AwFilterPipeType>>;

export type AwFilterByType<T> = AwFilterPipeProperties<T> | keyof T | (keyof T)[];

export const filter = <T>(array: T[], filterBy: AwFilterByType<T>, term?: any) => {
  if (!array?.length || !filterBy) return array;
  if (!isNil(term)) {
    if (!isArray(term)) {
      term = [term].filter(o => !isNil(o));
    }
    if (!term.length) {
      return array;
    }
  }
  if (isKeyof<T>(filterBy) || isString(filterBy) || isNumber(filterBy) || isSymbol(filterBy)) {
    if (isNil(term)) {
      return array;
    }
    return array.filter(val => term.includes(val[filterBy as keyof T]));
  } else if (isArray(filterBy)) {
    if (isNil(term)) {
      return array;
    }
    return array.filter(val => filterBy.some(key => term.includes(val[key])));
  } else {
    return awFilter(array, filterBy);
  }
};

@Pipe({ name: 'awFilter' })
export class AwFilterPipe implements PipeTransform {
  transform<T = any>(array: T[], filterBy: AwFilterByType<T>, term?: any): T[] {
    return filter(array, filterBy, term);
  }
}
