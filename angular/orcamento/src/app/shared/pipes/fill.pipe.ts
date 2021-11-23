import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fill',
})
export class FillPipe implements PipeTransform {
  transform<T = any>(value: T[], length: number): T[] {
    if (!value?.length || !length) {
      return [];
    }
    return Array.from({ length }).map((_, index) => value[index] ?? undefined);
  }
}
