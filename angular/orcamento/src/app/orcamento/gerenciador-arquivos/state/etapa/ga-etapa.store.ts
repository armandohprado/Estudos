import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { GaEtapa } from '../../model/etapa';
import { random } from 'lodash-es';

export interface GaEtapaState extends EntityState<GaEtapa> {
  hasLoaded: boolean;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'ga-etapa', resettable: true })
export class GaEtapaStore extends EntityStore<GaEtapaState> {
  constructor() {
    super();
    this.set(etapasPlaceholder);
  }

  reset(): void {
    super.reset();
    this.set(etapasPlaceholder);
  }
}

const etapasPlaceholder: GaEtapa[] = Array.from({ length: 3 }).map((_, index) => ({
  id: index,
  nome: 'Etapa ' + index + 1,
  ordem: index,
  selecionados: random(0, 10),
  publicados: random(0, 10),
  ativo: true,
  loading: false,
  'qtde-superar': random(0, 10),
}));
