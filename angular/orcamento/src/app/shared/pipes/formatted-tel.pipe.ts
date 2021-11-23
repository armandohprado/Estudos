import { Pipe, PipeTransform } from '@angular/core';
import { numeroEspecial } from './helpers';
import { replacePattern } from './replace-pattern/replace-pattern.pipe';
import { PatternEnum } from './match-pattern/pattern.enum';

@Pipe({
  name: 'formattedTel',
})
export class FormattedTelPipe implements PipeTransform {
  transform(value: string): string {
    if (value) {
      let tel;
      const receivedValue = value ? replacePattern(value, PatternEnum.onlyNumbers, '', 'g') : value;
      if (numeroEspecial(receivedValue) && receivedValue.length === 8) {
        tel = `${receivedValue.substring(0, 4)}-${receivedValue.substring(4, receivedValue.length - 4)}`;
      } else if (numeroEspecial(receivedValue) && receivedValue.length > 8) {
        tel = `${receivedValue.substring(0, 4)}-${receivedValue.substring(
          4,
          receivedValue.length - 4
        )}-${receivedValue.substring(receivedValue.length - 4, receivedValue.length)}`;
      } else if (receivedValue.length === 11) {
        tel = `(${receivedValue.substring(0, 2)}) ${receivedValue.substring(2, 7)}-${receivedValue.substring(
          7,
          receivedValue.length
        )}`;
      } else if (receivedValue.length <= 4) {
        tel = receivedValue.substring(0, 4);
      } else {
        tel = `(${receivedValue.substring(0, 2)}) ${receivedValue.substring(2, 6)}-${receivedValue.substring(
          6,
          receivedValue.length
        )}`;
      }
      return tel;
    }
  }
}
