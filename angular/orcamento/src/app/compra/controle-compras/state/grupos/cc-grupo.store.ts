import { Injectable } from '@angular/core';
import { EntityState, EntityStore, getEntityType, StoreConfig } from '@datorama/akita';
import { CnGrupo, CnTipoGrupoEnum } from '../../../models/cn-grupo';
import { cnGetValorSaldoAtualizado } from '../../util';

export interface CcGrupoState extends EntityState<CnGrupo> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'cc-grupos',
  idKey: 'idCompraNegociacaoGrupo',
  cache: { ttl: 900000 },
  resettable: true,
})
export class CcGrupoStore extends EntityStore<CcGrupoState> {
  constructor() {
    super({ loading: false, active: [] });
    this.akitaPreAddEntity = this.akitaPreAddEntity.bind(this);
    this.akitaPreUpdateEntity = this.akitaPreUpdateEntity.bind(this);
  }

  private _updateValores(grupo: CnGrupo): CnGrupo {
    return {
      ...grupo,
      valorSaldoAtualizado: cnGetValorSaldoAtualizado(grupo),
      valorImposto:
        grupo.tipo === CnTipoGrupoEnum.Refaturado
          ? grupo.valorLimiteCompra / ((100 - grupo.percentualImposto) / 100) - grupo.valorLimiteCompra
          : 0,
    };
  }

  akitaPreAddEntity(newEntity: any): getEntityType<CcGrupoState> {
    const grupo = super.akitaPreAddEntity(newEntity);
    return this._updateValores(grupo);
  }
  akitaPreUpdateEntity(_: Readonly<getEntityType<CcGrupoState>>, nextEntity: any): getEntityType<CcGrupoState> {
    const grupo = super.akitaPreUpdateEntity(_, nextEntity);
    return this._updateValores(grupo);
  }
}
