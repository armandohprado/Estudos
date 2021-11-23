import { Pipe, PipeTransform } from '@angular/core';
import { GaFamilia } from '../../model/familia';
import { GaArquivoGrupo } from '../../model/atividade';
import { isArray } from 'lodash-es';

export function reduceToGrupos(familia: GaFamilia): GaArquivoGrupo[] {
  return (familia.grupoes ?? []).reduce((acc, item) => [...acc, ...item.grupos.filter(grupo => grupo.selected)], []);
}

@Pipe({
  name: 'gaGruposSelecionados',
})
export class GaGruposSelecionadosPipe implements PipeTransform {
  transform(familia: GaFamilia): GaArquivoGrupo[];
  transform(familias: GaFamilia[]): GaArquivoGrupo[];
  transform(familia: GaFamilia | GaFamilia[]): GaArquivoGrupo[] {
    if (!familia) {
      return [];
    }
    if (isArray(familia)) {
      if (!familia.length) {
        return [];
      }
      return familia.reduce((acc, item) => [...acc, ...reduceToGrupos(item)], []);
    } else {
      return reduceToGrupos(familia);
    }
  }
}
