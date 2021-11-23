import { Pipe, PipeTransform } from '@angular/core';
import { sumBy } from 'lodash-es';
import { CnGrupo } from '../../models/cn-grupo';
import { arredondamento } from '@aw-shared/pipes/arredondamento.pipe';
import { filterFornecedoresSelecionados, isEstouroBudget } from '../../shared-compra/util';

@Pipe({
  name: 'validaEnvioMapa',
})
export class ValidaEnvioMapaPipe implements PipeTransform {
  transform(grupo: CnGrupo, valorEstouro: number, formularioInvalido: boolean): string | undefined {
    if (formularioInvalido) {
      return 'Preencha todos os campos necessários para o envio do mapa';
    }
    const fornecedoresSelecionados = filterFornecedoresSelecionados(grupo.gruposFornecedores);
    if (fornecedoresSelecionados.some(fornecedor => fornecedor.itemOmisso)) {
      return 'Existem propostas que possuem itens omissos selecionados';
    }

    if (!fornecedoresSelecionados.length) {
      return 'Nenhum fornecedor selecionado';
    }
    valorEstouro = arredondamento(valorEstouro, 2);
    const isEstouro = isEstouroBudget(valorEstouro);
    if (grupo.grupoNaoPrevisto) {
      return null;
    }
    if (
      isEstouro &&
      (sumBy(grupo.gruposTransferencia, 'transferencia') ?? 0) +
        (sumBy(grupo.gruposTransferenciaCC, 'valorTransferido') ?? 0) +
        valorEstouro !==
        0
    ) {
      return 'A soma das transferencias não é igual ao Saldo devedor!';
    }
  }
}
