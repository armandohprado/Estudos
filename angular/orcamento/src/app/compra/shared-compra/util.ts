import { CnGrupo } from '../models/cn-grupo';
import { CnFornecedor } from '../models/cn-fornecedor';
import { arredondamento } from '@aw-shared/pipes/arredondamento.pipe';

export function isDispensaConcorrencia(grupo: CnGrupo): boolean {
  return filterFornecedoresSelecionados(grupo.gruposFornecedores).length < 3 && !grupo.liberaFichaDispensa;
}

export function isEstouroBudget(valorMargem: number): boolean {
  return valorMargem < 0;
}

export function getMargemGrupoCn(valorUtilizado: number, valorSelecionado: number): number {
  return arredondamento(valorUtilizado - valorSelecionado, 2);
}

export function isEstouroBudgetFromValue(valorUtilizado: number, valorSelecionado: number): boolean {
  return isEstouroBudget(getMargemGrupoCn(valorUtilizado, valorSelecionado));
}

export function isDispensaConcorrenciaOuEstouroBudget(grupo: CnGrupo, valorMargem: number): boolean {
  return isEstouroBudget(valorMargem) || isDispensaConcorrencia(grupo);
}

export function filterFornecedoresSelecionados(fornecedores: CnFornecedor[] | undefined): CnFornecedor[] {
  return (
    fornecedores?.filter(
      fornecedor => !fornecedor.mapaEmitido && fornecedor.emitirMapaEmissaoCompra && fornecedor.selecionado
    ) ?? []
  );
}
