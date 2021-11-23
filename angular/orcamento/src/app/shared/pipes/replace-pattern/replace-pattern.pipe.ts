import { Pipe, PipeTransform } from '@angular/core';
import { isRegExp } from 'lodash-es';

export const replacePattern = (
  value: any,
  pattern: RegExp | string,
  replaceWith: any = '',
  flags = ''
): string => {
  return ('' + value).replace(
    isRegExp(pattern) ? pattern : new RegExp(pattern, flags),
    replaceWith
  );
};

@Pipe({ name: 'replacePattern' })
export class ReplacePatternPipe implements PipeTransform {
  transform(
    value: any,
    pattern: RegExp | string,
    replaceWith: any = '',
    flags = ''
  ): string {
    return replacePattern(value, pattern, replaceWith, flags);
  }
}
