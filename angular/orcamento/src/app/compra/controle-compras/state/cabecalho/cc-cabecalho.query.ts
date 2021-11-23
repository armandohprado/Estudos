import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { CcCabecalhoState, CcCabecalhoStore } from './cc-cabecalho.store';

@Injectable({ providedIn: 'root' })
export class CcCabecalhoQuery extends Query<CcCabecalhoState> {
  constructor(protected store: CcCabecalhoStore) {
    super(store);
  }

  loading$ = this.selectLoading();
  cabecalho$ = this.select();

  getIdPlanoCompra(): number {
    return this.getValue().idPlanoCompra;
  }

  getIdCompraNegociacao(): number {
    return this.getValue().idCompraNegociacao;
  }
}
