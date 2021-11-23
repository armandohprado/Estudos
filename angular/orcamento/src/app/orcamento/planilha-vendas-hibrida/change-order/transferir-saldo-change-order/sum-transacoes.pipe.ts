import { Pipe, PipeTransform } from '@angular/core';
import { GrupoTransferencia } from '../../../../models/controle-compras/grupo-transferencia';
import { sumBy } from 'lodash-es';

export function phSumTransacoes(
  gruposTransferencias: GrupoTransferencia[],
  idPlanilhaHibrida: number
): number {
  if (!gruposTransferencias?.length) {
    return 0;
  }
  return sumBy(
    gruposTransferencias.filter(
      grupo =>
        (!grupo.idPlanilhaHibridaDestinoTransferenciaCO ||
          grupo.idPlanilhaHibridaDestinoTransferenciaCO ===
            idPlanilhaHibrida) &&
        grupo.transferencia > 0
    ),
    'transferencia'
  );
}

@Pipe({ name: 'sumTransacoes' })
export class SumTransacoesPipe implements PipeTransform {
  transform(
    gruposTransferencias: GrupoTransferencia[],
    idPlanilhaHibrida: number
  ): number {
    return phSumTransacoes(gruposTransferencias, idPlanilhaHibrida);
  }
}
