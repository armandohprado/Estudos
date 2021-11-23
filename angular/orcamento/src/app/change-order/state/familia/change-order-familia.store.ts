import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Familia } from '@aw-models/index';

export interface ChangeOrderFamiliaState extends EntityState<Familia> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'change-order-familia' })
export class ChangeOrderFamiliaStore extends EntityStore<ChangeOrderFamiliaState> {
  constructor() {
    super();
  }
}
