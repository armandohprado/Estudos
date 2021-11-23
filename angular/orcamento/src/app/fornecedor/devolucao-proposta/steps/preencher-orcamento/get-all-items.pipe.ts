import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '@aw-models/devolucao-proposta/item';
import { flatMap } from 'lodash-es';
import { Pavimento } from '@aw-models/devolucao-proposta/pavimento-dp';

@Pipe({ name: 'getAllItems' })
export class GetAllItemsPipe implements PipeTransform {
  transform(value: Pavimento): Item[] {
    const itensAndares = flatMap(value.andares, andar => andar.itens).map(item => ({ ...item, tipo: 'Andares' }));
    const itensSites = flatMap(value.sites, site => site.itens).map(item => ({ ...item, tipo: 'Site' }));
    const itensEdificios = flatMap(value.edificios, edificio => edificio.itens).map(item => ({
      ...item,
      tipo: 'edificios',
    }));
    return [...itensAndares, ...itensSites, ...itensEdificios];
  }
}
