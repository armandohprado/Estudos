import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { ControleComprasStore } from './controle-compras.store';
import { CcSort, ControleCompras } from '@aw-models/controle-compras/controle-compras.model';
import { Observable } from 'rxjs';
import { CnGrupo, KeyofCcGrupos, CnTipoGrupoEnum } from '../../../models/cn-grupo';
import { map, pluck } from 'rxjs/operators';
import { AwFilterPipeProperties, AwFilterPipeType } from '@aw-components/aw-filter/aw-filter.pipe';

@Injectable({ providedIn: 'root' })
export class ControleComprasQuery extends Query<ControleCompras> {
  constructor(protected store: ControleComprasStore) {
    super(store);
  }

  listaFilterGrupos$ = this.select('filterGrupos');
  listaEmpresasFaturamento$ = this.select('listaEmpresaFaturamento');

  collapseDireto$ = this.select('collapseDireto');
  loaderDireto$ = this.select('loaderDireto');
  collapseRefaturado$ = this.select('collapseRefaturado');
  loaderRefaturado$ = this.select('loaderRefaturado');
  listaCausa$ = this.select('listaCausas').pipe(map(causas => causas.filter(causa => causa.status)));
  listaArea$ = this.select('listaAreas');
  tiposFicha$ = this.select('tiposFicha');

  selectSort(tipo: CnTipoGrupoEnum): Observable<CcSort> {
    return this.select('sortModel').pipe(pluck(tipo));
  }

  selectFilter(tipo: CnTipoGrupoEnum, property: KeyofCcGrupos): Observable<AwFilterPipeType> {
    return this.select('filterModel').pipe(pluck(tipo, property));
  }

  selectFilterByTipo(tipo: CnTipoGrupoEnum): Observable<AwFilterPipeProperties<CnGrupo>> {
    return this.select('filterModel').pipe(pluck(tipo));
  }

  getCollapseDireto(): boolean {
    return this.getValue().collapseDireto;
  }

  getCollapseRefaturado(): boolean {
    return this.getValue().collapseRefaturado;
  }
}
