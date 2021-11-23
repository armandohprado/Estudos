import { Pipe, PipeTransform } from '@angular/core';
import { StatusPropostaValorOrcamento } from '../models';
import { arredondamento } from '@aw-shared/pipes/arredondamento.pipe';

export interface PropostaStatusBudget {
  idProposta: number;
  desatualizadoProposta: boolean;
  valorTotalProposta: number;
  valorParcialProposta: number;
}

export function statusBudgetValue<T extends PropostaStatusBudget>(
  propostaAtual: T,
  propostas: T[]
): StatusPropostaValorOrcamento {
  if (propostaAtual.desatualizadoProposta) {
    return StatusPropostaValorOrcamento.Desatualizado;
  }
  const propostasValorParcial = propostas.filter(proposta => proposta.valorParcialProposta > 0);
  if (
    propostasValorParcial.length === 1 &&
    propostasValorParcial[0].idProposta === propostaAtual.idProposta &&
    arredondamento(propostaAtual.valorParcialProposta, 2) === arredondamento(propostaAtual.valorTotalProposta, 2)
  ) {
    return StatusPropostaValorOrcamento.Total;
  } else {
    return StatusPropostaValorOrcamento.Parcial;
  }
}

@Pipe({ name: 'statusBudgetValue' })
export class StatusBudgetValuePipe implements PipeTransform {
  transform<T extends PropostaStatusBudget>(propostaAtual: T, propostas: T[]): StatusPropostaValorOrcamento {
    return statusBudgetValue(propostaAtual, propostas);
  }
}
