import { Pipe, PipeTransform } from '@angular/core';
import { CnConfirmacaoCompraModo, CnGrupo } from '../../../../../../../models/cn-grupo';
import { isEstouroBudgetFromValue } from '../../../../../../../shared-compra/util';

const confirmacaoCompraModosSemValidacao = [CnConfirmacaoCompraModo.Miscellaneous, CnConfirmacaoCompraModo.Revenda];

@Pipe({ name: 'cnExibeFormConfirmacaoCompra' })
export class CnExibeFormConfirmacaoCompraPipe implements PipeTransform {
  transform(grupo: CnGrupo): boolean {
    return (
      // Se não tiver com a flag, retorna true
      !grupo.permitidoEmitirCcSemMapa ||
      // Se tiver com a flag, e o switch estiver no modo de Miscellaneous ou Revenda, retorna true
      confirmacaoCompraModosSemValidacao.includes(grupo.confirmacaoCompraModo) ||
      // Se tiver com a flag, o switch estiver no modo de fornecedor, e não for estouro de budget, retorna true
      !isEstouroBudgetFromValue(grupo.valorUtilizado, grupo.grupoOrcamento.valorSelecionado) ||
      // Se tiver com a flag, o switch estiver no modo de fornecedor, for estouro de budget e tiver alguma ficha, retorna true
      !!grupo.fichas?.length
      // Se não, retorna false
    );
  }
}
