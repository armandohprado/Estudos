import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { UnidadeMedida } from '../../models/unidade-medida';

export interface UnidadeMedidasState extends EntityState<UnidadeMedida> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'unidade-medidas', idKey: 'idUnidadeMedida' })
export class UnidadeMedidaStore extends EntityStore<UnidadeMedidasState> {
  constructor() {
    super();
  }
}
