import { Pipe, PipeTransform } from '@angular/core';
import { GaAnexoAvulso } from '../../model/anexo-avulso';

@Pipe({
  name: 'gaAnexosAvulsosFilter',
})
export class GaAnexosAvulsosFilterPipe implements PipeTransform {
  transform(anexos: GaAnexoAvulso[], onlySelected: boolean): GaAnexoAvulso[] {
    if (!anexos?.length) {
      return [];
    }
    if (!onlySelected) {
      return anexos;
    } else {
      return anexos.filter(anexo => anexo.ativo);
    }
  }
}
