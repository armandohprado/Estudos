import { Pipe, PipeTransform } from '@angular/core';
import { GrupoTransferencia } from '../../../../models/controle-compras/grupo-transferencia';

@Pipe({ name: 'hasAnyTransferencia' })
export class HasAnyTransferenciaPipe implements PipeTransform {
  transform(value: GrupoTransferencia[]): boolean {
    return value?.some(grupo => grupo.updated);
  }
}
