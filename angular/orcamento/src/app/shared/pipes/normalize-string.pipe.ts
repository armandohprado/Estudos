import { Pipe, PipeTransform } from '@angular/core';
import { normalize } from '../../utils/string';

@Pipe({ name: 'normalizeString' })
export class NormalizeStringPipe implements PipeTransform {
  transform(str: string): string {
    return normalize(str);
  }
}
