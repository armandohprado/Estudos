import { Pipe, PipeTransform } from '@angular/core';
import { PropostaAlt } from '../models';

@Pipe({ name: 'desativaProposta' })
export class DesativaPropostaPipe implements PipeTransform {
  transform(propostas: PropostaAlt[], toggle: boolean): PropostaAlt[] {
    if (!propostas?.length || !toggle) {
      return propostas;
    }
    return propostas.filter(proposta => !proposta.desativaProposta);
  }
}
