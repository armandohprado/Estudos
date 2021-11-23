import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { GaAnexoAvulsoStore, GaAnexoAvulsoState } from './ga-anexo-avulso.store';

@Injectable({ providedIn: 'root' })
export class GaAnexoAvulsoQuery extends QueryEntity<GaAnexoAvulsoState> {
  constructor(protected store: GaAnexoAvulsoStore) {
    super(store);
  }

  all$ = this.selectAll();

  hasLoaded(): boolean {
    return this.getValue().hasLoaded;
  }
}
