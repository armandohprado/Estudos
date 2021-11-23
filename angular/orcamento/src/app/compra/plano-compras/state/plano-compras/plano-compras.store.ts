import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { PlanoCompras } from '../../models/plano-compras';

export interface PlanoComprasState extends EntityState<PlanoCompras, string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'plano-compras', cache: { ttl: 900000 } })
export class PlanoComprasStore extends EntityStore<PlanoComprasState> {
  constructor() {
    super();
  }
}
