import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { ControleCompras } from '@aw-models/controle-compras/controle-compras.model';

export function createInitialState(): ControleCompras {
  return {
    collapseDireto: true,
    collapseRefaturado: true,
    contratoTipo: null,
    filterGrupos: [],
    filterModel: {},
    sortModel: {},
    listaAreas: [],
    listaCausas: [],
    listaCausasDispensa: [],
    listaEmpresaFaturamento: [],
    tiposFicha: [],
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'controle-compras', resettable: true })
export class ControleComprasStore extends Store<ControleCompras> {
  constructor() {
    super(createInitialState());
  }
}
