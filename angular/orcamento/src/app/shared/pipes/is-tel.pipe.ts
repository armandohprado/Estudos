import { Pipe, PipeTransform } from '@angular/core';
import { replacePattern } from './replace-pattern/replace-pattern.pipe';
import { PatternEnum } from './match-pattern/pattern.enum';

@Pipe({ name: 'isTel' })
export class IsTelPipe implements PipeTransform {
  transform(value): boolean {
    if (!!value) {
      const tel = replacePattern(value, PatternEnum.onlyNumbers, '', 'g');
      const ddd = parseInt(tel.substring(0, 2), 10);
      const telWithoutDDD = tel.substring(2, tel.length);
      if (ddd <= 10 || ddd >= 100) {
        return false;
      }
      return (
        telWithoutDDD.length === 8 ||
        (telWithoutDDD.length === 9 &&
          [7, 8, 9].includes(parseInt(telWithoutDDD.charAt(0), 10)))
      );
    }
  }
}
