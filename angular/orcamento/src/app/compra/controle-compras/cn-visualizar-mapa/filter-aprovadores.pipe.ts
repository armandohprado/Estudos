import { Pipe, PipeTransform } from '@angular/core';
import { CompraNegociacaoGrupoFichaAprovador } from '../../models/cn-mapa';

@Pipe({
  name: 'filterAprovadores',
})
export class FilterAprovadoresPipe implements PipeTransform {
  transform(value: CompraNegociacaoGrupoFichaAprovador[], tipo: boolean): CompraNegociacaoGrupoFichaAprovador[] {
    return (value ?? []).filter(aprovador => aprovador.tipo === tipo);
  }
}
