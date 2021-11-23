import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { CnCabecalho } from '../../../models/cn-cabecalho';

export type CcCabecalhoState = CnCabecalho;

export function createInitialState(): CcCabecalhoState {
  return {
    idCompraNegociacao: 0,
    idOrcamentoCenario: 0,
    valorTotalVendaCongelada: 0,
    valorTotalEmissaoCC: 0,
    valorTotalProjecao: 0,
    valorSaldoContingencia: 0,
    valorTotalMargemVendaCongelada: 0,
    valorTotalMargemEmissaoCC: 0,
    valorTotalMargemProjecao: 0,
    valorTotalMargemSaldoContingencia: 0,
    valorTotalMetaCompra: 0,
    valorTotalMetaMiscellaneous: 0,
    percentualMargemVendaCongelada: 0,
    percentualMargemEmissaoCC: 0,
    percentualMargemProjecao: 0,
    percentualMargemSaldoContingencia: 0,
    valorTotalMiscellaneous: 0,
    dataCarga: '',
    dataUltimaAlteracao: '',
    valorTotalLimiteCompra: 0,
    valorTotalMiscellaneousReservado: 0,
    valorTotalSaldo: 0,
    valorTotalSaldoContingencia: 0,
    valorTotalSaldoContingenciaReservado: 0,
    idPlanoCompra: 0,
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'cc-cabecalho' })
export class CcCabecalhoStore extends Store<CcCabecalhoState> {
  constructor() {
    super(createInitialState());
  }
}
