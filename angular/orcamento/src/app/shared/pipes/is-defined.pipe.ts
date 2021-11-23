import { Pipe, PipeTransform } from '@angular/core';
import { isUndefined } from 'lodash-es';

@Pipe({ name: 'isDefined' })
export class IsDefinedPipe implements PipeTransform {
  transform<T>(value: T): value is T {
    return !isUndefined(value);
  }
}
