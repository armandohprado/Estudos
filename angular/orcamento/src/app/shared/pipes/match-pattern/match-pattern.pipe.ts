import { Pipe, PipeTransform } from '@angular/core';
import { isRegExp } from 'lodash-es';

export const matchPattern = (
  value: any,
  pattern: RegExp | string,
  options = ''
): boolean => {
  return isRegExp(pattern)
    ? pattern.test('' + value)
    : new RegExp(pattern, options).test('' + value);
};

@Pipe({ name: 'matchPattern' })
export class MatchPatternPipe implements PipeTransform {
  transform(value: any, pattern: RegExp | string, options = ''): boolean {
    return matchPattern(value, pattern, options);
  }
}
