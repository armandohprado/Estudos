import { Pipe, PipeTransform } from '@angular/core';
import { Andar } from '@aw-models/devolucao-proposta/andar-dp';

@Pipe({
  name: 'filterPavimentoAndares',
})
export class FilterPavimentoAndaresPipe implements PipeTransform {
  transform(arr: Andar[], filtro: Andar[]): Andar[] {
    if (!filtro.length) {
      return arr;
    }
    return arr.filter(andar => {
      return filtro.map(andarF => andarF.idProjetoEdificioPavimento).includes(andar.idProjetoEdificioPavimento);
    });
  }
}
