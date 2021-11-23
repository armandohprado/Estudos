import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Entity } from '../../../../utils/types/entity';
import { GaAtividade } from '../../model/atividade';

export function getAtividadeId(atividade: GaAtividade): string {
  return `${atividade.idAtividade}-${atividade.idEtapa}-${atividade.idCondominio}-${atividade?.idEdificio ?? ''}-${
    atividade?.idPavimento ?? ''
  }`;
}

export interface GaAtividadeState extends EntityState<GaAtividade> {
  loadingAtividades: Entity<boolean>;
  onlySelected: boolean;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'ga-atividade', resettable: true })
export class GaAtividadeStore extends EntityStore<GaAtividadeState> {
  constructor() {
    super({ loadingAtividades: {}, onlySelected: false });
  }
}
