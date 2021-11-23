import { Pipe, PipeTransform } from '@angular/core';
import { Grupao } from './models/grupao';

@Pipe({ name: 'grupaoHasAnyGrupo' })
export class GrupaoHasAnyGruposPipe implements PipeTransform {
  transform(value: Grupao[]): boolean {
    return value?.some(grupao => grupao.grupos?.length);
  }
}
