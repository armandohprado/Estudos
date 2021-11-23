import { Pipe, PipeTransform } from '@angular/core';
import { isString } from 'lodash-es';
import { isAfter, isValid, parseISO } from 'date-fns';

@Pipe({ name: 'isAfterNow' })
export class IsAfterNowPipe implements PipeTransform {
  transform(value: Date | string | number): boolean {
    if (!value) {
      return false;
    }
    let date: Date;
    if (isString(value)) {
      date = parseISO(value);
    }
    return isValid(date) && isAfter(new Date(), date);
  }
}
