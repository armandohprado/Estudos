import { Pipe, PipeTransform } from '@angular/core';
import { Grupao } from '../../models';

@Pipe({ name: 'selectionGroupCounter' })
export class SelectionGroupCounterPipe implements PipeTransform {
  transform(list: Grupao[]): number {
    return (list ?? []).reduce((acc, grupao) => acc + (grupao.grupos?.length ?? 0), 0);
  }
}
