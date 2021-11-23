import { Pipe, PipeTransform } from '@angular/core';
import { sumBy } from 'lodash-es';

@Pipe({
  name: 'awSumBy',
})
export class AwSumByPipe implements PipeTransform {
  transform<T = any>(value: T[], property: keyof T): number {
    if (!value?.length || !property) {
      return 0;
    }
    return sumBy(value, property as string) ?? 0;
  }
}
