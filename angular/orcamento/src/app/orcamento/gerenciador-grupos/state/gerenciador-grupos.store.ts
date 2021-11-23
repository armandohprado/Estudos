import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { CenarioGG, FamiliaGG } from './gerenciador-grupo.model';

export interface GerenciadorGruposState extends EntityState<FamiliaGG> {
  cenarios: CenarioGG[];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'gerenciador-grupos', idKey: 'idOrcamentoFamilia' })
export class GerenciadorGruposStore extends EntityStore<GerenciadorGruposState> {
  constructor() {
    super({ loading: true, cenarios: [] });
  }
}
