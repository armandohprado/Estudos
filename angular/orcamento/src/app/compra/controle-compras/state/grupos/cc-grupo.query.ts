import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { CcGrupoState, CcGrupoStore } from './cc-grupo.store';
import { CnGrupo, CnTipoGrupoEnum } from '../../../models/cn-grupo';
import { combineLatest, defer, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { orderByOperator } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { isArray } from 'lodash-es';
import { CnConfirmacaoCompraFornecedor } from '../../../models/cn-confirmacao-compra';
import { CcSort } from '@aw-models/controle-compras/controle-compras.model';
import { AwFilterPipeProperties, filter as filterPipe } from '../../../../aw-components/aw-filter/aw-filter.pipe';
import { awFilter } from '@aw-components/aw-filter/aw-filter.util';
import { CnFornecedor } from '../../../models/cn-fornecedor';
import { filterFornecedoresSelecionados } from '../../../shared-compra/util';
import { cnMapGrupoDuplicados } from '../../util';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';

@Injectable({ providedIn: 'root' })
export class CcGrupoQuery extends QueryEntity<CcGrupoState> {
  constructor(protected store: CcGrupoStore, private orcamentoAltService: OrcamentoAltService) {
    super(store);
  }

  activeId$ = this.selectActiveId();
  listAll$: Observable<CnGrupo[]> = combineLatest([this.selectAll(), this.orcamentoAltService.gruposMap$]).pipe(
    map(([grupos, gruposMap]) =>
      grupos.map(grupo => ({ ...grupo, grupoOrcamento: gruposMap.get(grupo.idOrcamentoGrupo) }))
    )
  );

  selectGruposFilterAndGroup(
    tipo: CnTipoGrupoEnum,
    sort: CcSort,
    filterProperties: AwFilterPipeProperties<CnGrupo>,
    filterGrupos: number[]
  ): Observable<CnGrupo[]> {
    return this.listAll$.pipe(
      map(grupos => {
        grupos = grupos.filter(grupo => grupo.tipo === tipo);
        grupos = awFilter(grupos, filterProperties);
        grupos = filterPipe(grupos, 'idGrupo', filterGrupos);
        grupos = cnMapGrupoDuplicados(grupos);
        return grupos;
      }),
      orderByOperator(sort?.property, sort?.order)
    );
  }

  buscarId(idCompraNegociacaoGrupo: number): CnGrupo {
    return this.getEntity(idCompraNegociacaoGrupo);
  }

  getActiveIdCustom(): number[] {
    let activeIds: number[] = this.getActiveId();
    if (!activeIds?.length) {
      return [];
    }
    if (!isArray(activeIds)) {
      activeIds = [activeIds];
    }
    return activeIds;
  }

  getMisc(idCompraNegociacaoGrupo: number, index: number): CnConfirmacaoCompraFornecedor {
    return this.getEntity(idCompraNegociacaoGrupo).confirmacaoCompraMiscellaneous[index];
  }

  selectFornecedoresSelecionados(idCompraNegociacaoGrupo: number): Observable<CnFornecedor[]> {
    return this.selectEntity(idCompraNegociacaoGrupo).pipe(
      map(grupo => filterFornecedoresSelecionados(grupo.gruposFornecedores))
    );
  }

  selectFornecedorSelecionadosOperator<T extends number | null | undefined>(): MonoTypeOperatorFunction<
    CnFornecedor[]
  > {
    return source =>
      defer(() =>
        source.pipe(
          filter(idCompraNegociacaoGrupo => !!idCompraNegociacaoGrupo),
          map(Number),
          shareReplay(),
          switchMap(id => this.selectFornecedoresSelecionados(id))
        )
      );
  }

  isActive(idCompraNegociacaoGrupo: number): boolean {
    return this.getActiveIdCustom().includes(idCompraNegociacaoGrupo);
  }
}
