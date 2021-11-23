import { Pipe, PipeTransform } from '@angular/core';
import { GruposTransferenciaCC } from '../../../../models/transferencia-cc';
import { PlanilhaHibridaTransferirSaldoCC } from '../../../../orcamento/planilha-vendas-hibrida/models/transferir-saldo';
import { sumBy } from 'lodash-es';

@Pipe({
  name: 'mergeGrupoTransferenciaCC',
})
export class MergeGrupoTransferenciaCCPipe implements PipeTransform {
  transform(
    value: GruposTransferenciaCC[],
    transferencia: PlanilhaHibridaTransferirSaldoCC[]
  ): GruposTransferenciaCC[] {
    return value.map(grupo => {
      const listaTransferencias = (transferencia ?? []).filter(
        trans => trans.idCompraNegociacaoGrupo === grupo.idCompraNegociacaoGrupo
      );
      return {
        ...grupo,
        valorUtilizado: listaTransferencias.length
          ? sumBy(listaTransferencias, 'valorTransferido')
          : grupo.valorUtilizado,
      };
    });
  }
}
