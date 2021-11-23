import { Injectable } from '@angular/core';
import { EntityState, EntityStore, getEntityType, StoreConfig } from '@datorama/akita';
import { ProjetoAmbiente } from '../../models/projeto-ambiente';
import { getTipoForroList, TipoForro } from '../../models/tipo-forro';

function getTipoForro(idTipoForro: number): TipoForro | undefined {
  if (!idTipoForro) {
    return undefined;
  }
  return getTipoForroList().find(tipoForro => tipoForro.idTipoForro === idTipoForro);
}

export interface ProjetoAmbienteState extends EntityState<ProjetoAmbiente> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'projeto-ambiente', idKey: 'idProjetoAmbiente' })
export class ProjetoAmbienteStore extends EntityStore<ProjetoAmbienteState> {
  constructor() {
    super();
  }

  akitaPreAddEntity(newEntity: ProjetoAmbiente): getEntityType<ProjetoAmbienteState> {
    const tipoForro = getTipoForro(newEntity.idTipoForro);
    if (tipoForro) {
      newEntity = { ...newEntity, forro: tipoForro.descricao };
    }
    return { ...super.akitaPreAddEntity(newEntity) };
  }

  akitaPreUpdateEntity(
    entity: Readonly<getEntityType<ProjetoAmbienteState>>,
    nextEntity: Partial<ProjetoAmbiente>
  ): getEntityType<ProjetoAmbienteState> {
    if (entity.idTipoForro !== nextEntity.idTipoForro) {
      nextEntity = { ...nextEntity, forro: getTipoForro(nextEntity.idTipoForro)?.descricao };
    }
    return super.akitaPreUpdateEntity(entity, nextEntity);
  }
}
