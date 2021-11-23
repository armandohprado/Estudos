import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { EpPropostaItemQuery } from '../state/item/ep-proposta-item.query';
import { distinctUntilKeysChanged, StateComponent } from '@aw-shared/components/common/state-component';
import { EpPropostaItemPropertyComparativo } from '../model/item';

export type EpComparativoType = 'total' | 'item';

export interface EpBannerComparativoState {
  idFornecedor?: number;
  idPropostaItem?: number;
  type?: EpComparativoType;
  comparativo?: EpPropostaItemPropertyComparativo;
  idFasePavimentoCentro?: string;
}

@Component({
  selector: 'app-ep-banner-comparativo',
  templateUrl: './ep-banner-comparativo.component.html',
  styleUrls: ['./ep-banner-comparativo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpBannerComparativoComponent extends StateComponent<EpBannerComparativoState> {
  constructor(public epPropostaItemQuery: EpPropostaItemQuery) {
    super({}, { inputs: ['idFornecedor', 'idPropostaItem', 'type', 'comparativo', 'idFasePavimentoCentro'] });
  }

  @Input() hideShadow = false;
  @Input() idFornecedor: number;
  @Input() idPropostaItem: number;
  @Input() type: EpComparativoType;
  @Input() comparativo: EpPropostaItemPropertyComparativo;
  @Input() idFasePavimentoCentro: string;

  percent$: Observable<number> = this.selectState().pipe(
    filter(
      ({ idPropostaItem, idFornecedor, type, comparativo, idFasePavimentoCentro }) =>
        !!(type && (idFornecedor || (idPropostaItem && (idFasePavimentoCentro || comparativo))))
    ),
    distinctUntilKeysChanged(['idFasePavimentoCentro', 'idPropostaItem', 'idFornecedor', 'type', 'comparativo']),
    switchMap(({ idPropostaItem, idFornecedor, type, comparativo, idFasePavimentoCentro }) => {
      switch (type) {
        case 'total': {
          return this.epPropostaItemQuery.compareFornecedorTotalWithAwReferencia(idFornecedor);
        }
        default: {
          return this.epPropostaItemQuery.compareItemWithAwReferenia(
            idPropostaItem,
            comparativo,
            idFasePavimentoCentro
          );
        }
      }
    }),
    distinctUntilChanged()
  );

  showColor$ = combineLatest([this.percent$, this.epPropostaItemQuery.indiceComparativa$]).pipe(
    map(([percent, indiceComparativa]) => Math.abs(percent * 100) >= indiceComparativa),
    distinctUntilChanged()
  );
}
