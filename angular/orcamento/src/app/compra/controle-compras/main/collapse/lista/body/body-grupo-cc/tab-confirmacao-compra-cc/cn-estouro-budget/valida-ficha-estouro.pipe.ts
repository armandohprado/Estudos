import { Pipe, PipeTransform } from '@angular/core';
import { CnGrupo } from '../../../../../../../../models/cn-grupo';
import { sumBy } from 'lodash-es';
import { arredondamento } from '@aw-shared/pipes/arredondamento.pipe';

@Pipe({ name: 'cnValidaFichaEstouro' })
export class CnValidaFichaEstouroPipe implements PipeTransform {
  transform(grupo: CnGrupo, valorEstouro: number, formInvalid: boolean): string | null {
    if (formInvalid) {
      return 'Preencha todos os campos necessarios para a ficha';
    }
    if (grupo.grupoNaoPrevisto) {
      return null;
    }
    valorEstouro = arredondamento(valorEstouro, 2);
    if (
      (sumBy(grupo.gruposTransferencia, 'transferencia') ?? 0) +
        (sumBy(grupo.gruposTransferenciaCC, 'valorTransferido') ?? 0) +
        valorEstouro !==
      0
    ) {
      return 'A soma das transferencias não é igual ao Saldo devedor!';
    }
    return null;
  }
}
