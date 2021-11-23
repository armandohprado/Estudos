import { Pipe, PipeTransform } from '@angular/core';
import { Pavimento } from '@aw-models/devolucao-proposta/pavimento-dp';

@Pipe({ name: 'filterEdificio' })
export class FilterEdificioPipe implements PipeTransform {
  transform(proposta: Pavimento, idEficio: number): Pavimento {
    if (!proposta) {
      return proposta;
    }
    return {
      ...proposta,
      edificios: (proposta.edificios ?? []).filter(edificio => edificio.idEdificio === idEficio),
      sites: (proposta.sites ?? []).filter(site => site.idEdificio === idEficio),
      andares: (proposta.andares ?? []).filter(andar => andar.idEdificio === idEficio),
    };
  }
}
