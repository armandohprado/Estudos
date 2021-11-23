import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { PcCabecalho } from '../../models/pc-cabecalho';

export type PcCabecalhoState = PcCabecalho;

export function createInitialState(): PcCabecalhoState {
  return {
    valorTotalImpostoPrevistoDesenvolvimento: 0,
    valorTotalMetaMiscellaneous: 0,
    percentualImpostoPrevisto: 0,
    percentualPotencialLucro: 0,
    potencialLucroPrevisto: 0,
    valorOrcado: 0,
    valorTotalMetaCompra: 0,
    valorVendaCongelada: 0,
    percentualTotalImpostoPrevistoDesenvolvimento: 0,
    percentualTotalMetaCompra: 0,
    percentualTotalMetaMiscellaneous: 0,
    valorImpostoRefaturamento: 0,
    valorVenda: 0,
    idPlanoCompra: 0,
    valorDescontoComercial: 0,
    percentualDescontoComercial: 0,
    congelado: false,
    minified: false,
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'pc-cabecalho', cache: { ttl: 300000 } })
export class PcCabecalhoStore extends Store<PcCabecalhoState> {
  constructor() {
    super(createInitialState());
  }
}
