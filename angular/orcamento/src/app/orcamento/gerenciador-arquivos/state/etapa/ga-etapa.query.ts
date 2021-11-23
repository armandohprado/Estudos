import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { GaEtapaState, GaEtapaStore } from './ga-etapa.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { sumBy } from 'lodash-es';
import { GaEtapa } from '../../model/etapa';

@Injectable({ providedIn: 'root' })
export class GaEtapaQuery extends QueryEntity<GaEtapaState> {
  constructor(protected store: GaEtapaStore) {
    super(store);
  }

  all$ = this.selectAll();

  selected$ = this.selectActive() as Observable<GaEtapa>;

  superarCount$ = this.all$.pipe(map(etapas => sumBy(etapas, 'qtde-superar')));

  hasLoaded(): boolean {
    return this.getValue().hasLoaded;
  }
}
