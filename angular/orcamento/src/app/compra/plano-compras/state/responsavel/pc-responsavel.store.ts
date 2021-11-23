import { Injectable } from '@angular/core';
import {
  EntityState,
  EntityStore,
  getEntityType,
  StoreConfig,
} from '@datorama/akita';
import { PcResponsavel } from '../../models/pc-responsavel';
import { union } from 'lodash-es';

export interface PcResponsavelState extends EntityState<PcResponsavel> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'pc-responsavel', cache: { ttl: 450000 } })
export class PcResponsavelStore extends EntityStore<PcResponsavelState> {
  constructor() {
    super({ loading: false });
  }

  akitaPreUpdateEntity(
    oldEntity: Readonly<getEntityType<PcResponsavelState>>,
    nextEntity: PcResponsavel
  ): getEntityType<PcResponsavelState> {
    const responsabilidades = union(
      oldEntity.responsabilidades,
      nextEntity.responsabilidades ?? []
    );
    return {
      ...oldEntity,
      ...nextEntity,
      responsabilidades,
    };
  }
}
