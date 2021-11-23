import { Pipe, PipeTransform } from '@angular/core';
import { Grupao } from '../../../../../../models';
import { search } from '../../../../../../aw-components/aw-utils/aw-search/aw-search.pipe';

@Pipe({
  name: 'searchGrupaoGrupo',
})
export class SearchGrupaoGrupoPipe implements PipeTransform {
  transform(grupoes: Grupao[], term: string): Grupao[] {
    if (!term) {
      return grupoes;
    }
    return grupoes
      .map(grupao => ({
        ...grupao,
        grupos: search(grupao.grupos, ['codigoGrupo', 'nomeGrupo'], term),
      }))
      .filter(grupao => grupao.grupos.length);
  }
}
