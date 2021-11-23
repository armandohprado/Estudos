import { Pipe, PipeTransform } from '@angular/core';
import { Grupo, Proposta, SupplierRule } from '../../models';

@Pipe({ name: 'supplierRule' })
export class SupplierRulePipe implements PipeTransform {
  transform(grupo: Grupo): string {
    const { fornecedores, propostas } = grupo;

    const propostasFiltradas: Proposta[] = propostas.filter(proposta => proposta.valorParcialProposta);

    if (grupo.valorSelecionado && propostasFiltradas.length > 0) {
      if (propostasFiltradas.length > 1) {
        return SupplierRule.MULTIPLOS;
      } else {
        const fornecedor = fornecedores.find(f => propostasFiltradas.some(pF => f.idFornecedor === pF.idFornecedor));
        return fornecedor.nomeFantasia;
      }
    }
    return SupplierRule.META;
  }
}
