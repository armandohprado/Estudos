import { Pipe, PipeTransform } from '@angular/core';
import { Grupo } from '../../models';

@Pipe({ name: 'hasSelectedGroups' })
export class HasSelectedGroupsPipe implements PipeTransform {
  transform(grupos: Grupo[]): boolean {
    return (grupos ?? []).some(gr => gr.selecionado);
  }
}
