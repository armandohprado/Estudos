import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '@aw-models/devolucao-proposta/item';
import { Pavimento } from '@aw-models/devolucao-proposta/pavimento-dp';

@Pipe({
  name: 'filterPavimentoItens',
})
export class FilterPavimentoItensPipe implements PipeTransform {
  transform(arr: Pavimento, filtro: Item[]): any {
    if (!filtro.length) {
      return arr;
    }
    const newArr = { ...arr };
    for (const key in newArr) {
      if (newArr[key]) {
        newArr[key] = newArr[key]
          .filter((pavimento, index) => {
            return (
              index === 0 ||
              pavimento.itens.some(item => filtro.map(o => o.idPropostaItem).includes(item.idPropostaItem))
            );
          })
          .map(pavimento => {
            pavimento.itens = pavimento.itens.filter(item =>
              filtro.map(o => o.idPropostaItem).includes(item.idPropostaItem)
            );
            pavimento.omissos = pavimento.omissos.filter(item =>
              filtro.map(o => o.idPropostaItem).includes(item.idPropostaItem)
            );
            return pavimento;
          });
      }
    }
    return newArr;
  }
}
