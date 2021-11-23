import { Pipe, PipeTransform } from '@angular/core';
import { Grupao } from '@aw-models/index';

@Pipe({ name: 'hasGroupsSelected' })
export class HasGroupsSelectedPipe implements PipeTransform {
  transform(grupao: Grupao): boolean {
    return !!grupao?.grupos?.some(grupo => grupo.selecionado);
  }
}
