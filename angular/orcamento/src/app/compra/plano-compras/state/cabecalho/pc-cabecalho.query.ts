import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { PcCabecalhoState, PcCabecalhoStore } from './pc-cabecalho.store';
import { combineLatest, Observable } from 'rxjs';
import { PcCabecalhoValor } from '../../models/pc-cabecalho';
import { map } from 'rxjs/operators';
import { PlanoComprasQuery } from '../plano-compras/plano-compras.query';

@Injectable({ providedIn: 'root' })
export class PcCabecalhoQuery extends Query<PcCabecalhoState> {
  constructor(protected store: PcCabecalhoStore, private planoComprasQuery: PlanoComprasQuery) {
    super(store);
  }

  loading$ = this.selectLoading();
  cabecalho$ = this.select();
  congelado$ = combineLatest([this.select('congelado'), this.planoComprasQuery.comentarioMetaCompraNegativa$]).pipe(
    map(([congelado, comentarioMetaComprasNegativa]) => congelado || comentarioMetaComprasNegativa)
  );
  congeladoPlano$ = this.select('congelado');
  minified$ = this.select('minified');

  valoresCabecalho$: Observable<PcCabecalhoValor[]> = this.select(cabecalho => {
    if (!cabecalho) return [];
    return [
      {
        title: 'Total orçado DNN',
        value: cabecalho?.valorOrcado,
      },
      {
        title: 'Total margem prevista DNN ',
        value: cabecalho?.potencialLucroPrevisto,
        hasPercent: 'percentualPotencialLucro',
      },
      {
        title: 'Total de venda sem impostos',
        value: cabecalho?.valorVenda,
      },

      {
        title: 'Total impostos previstos DNN',
        value: cabecalho?.valorImpostoRefaturamento,
        hasPercent: 'percentualImpostoPrevisto',
      },
      {
        title: 'Total de venda com impostos congelada',
        value: cabecalho?.valorVendaCongelada,
        subValue: cabecalho?.valorDescontoComercial,
        subPercent: 'percentualDescontoComercial',
      },
      null,
      {
        title: 'Meta de compra sem impostos DES',
        value: cabecalho?.valorTotalMetaCompra,
        hasPercent: 'percentualTotalMetaCompra',
      },
      {
        title: 'Imposto previsto desenvolvimento',
        value: cabecalho?.valorTotalImpostoPrevistoDesenvolvimento,
        hasPercent: 'percentualTotalImpostoPrevistoDesenvolvimento',
      },
      {
        title: 'Meta de miscelâneas',
        value: cabecalho?.valorTotalMetaMiscellaneous,
        hasPercent: 'percentualTotalMetaMiscellaneous',
      },
    ];
  });

  isCongelado(): boolean {
    return this.getValue().congelado;
  }
}
