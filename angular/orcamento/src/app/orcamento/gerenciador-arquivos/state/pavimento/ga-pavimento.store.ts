import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { GaAndar, GaEdificio, GaSite, PavimentoType } from '../../model/pavimento';
import { ProjetoAlt } from '../../../../models';

export interface GaPavimentoState extends EntityState<GaSite> {
  hasLoaded: boolean;
  siteSelected?: GaSite;
  edificioSelected?: GaEdificio;
  andarSelected?: GaAndar;
  projetoSelected?: ProjetoAlt;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'ga-pavimento', resettable: true })
export class GaPavimentoStore extends EntityStore<GaPavimentoState> {
  constructor() {
    super();
    this.set(pavimentosPlaceholder);
  }

  reset(): void {
    super.reset();
    this.set(pavimentosPlaceholder);
  }
}

const pavimentosPlaceholder: GaSite[] = [
  {
    type: PavimentoType.site,
    nome: 'Condomínio',
    id: 0,
    edificios: [
      {
        id: 1,
        nome: 'Edifício',
        idSite: 0,
        type: PavimentoType.edificio,
        pavimentos: [
          {
            id: 2,
            idEdificio: 1,
            idSite: 0,
            nome: 'Andar',
            ordem: 0,
            type: PavimentoType.andar,
          },
        ],
      },
    ],
  },
];
