import { Pipe, PipeTransform } from '@angular/core';
import { Familia } from '@aw-models/index';

@Pipe({ name: 'countGruposSelecionados' })
export class CountGruposSelecionadosPipe implements PipeTransform {
  transform(familia: Familia): number {
    return (familia?.grupoes ?? []).reduce((acc1, grupao) => {
      return acc1 + (grupao?.grupos ?? []).filter(grupo => grupo.selecionado).length;
    }, 0);
  }
}
