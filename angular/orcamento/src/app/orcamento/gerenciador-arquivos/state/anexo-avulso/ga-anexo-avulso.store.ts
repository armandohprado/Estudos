import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { GaAnexoAvulso } from '../../model/anexo-avulso';

export interface GaAnexoAvulsoState extends EntityState<GaAnexoAvulso> {
  hasLoaded: boolean;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'ga-anexo-avulso', resettable: true, idKey: 'idOrcamentoGrupoAnexo' })
export class GaAnexoAvulsoStore extends EntityStore<GaAnexoAvulsoState> {
  constructor() {
    super();
  }
}
