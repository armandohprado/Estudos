import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { combineLatest, Observable, tap } from 'rxjs';
import { ErrorApi } from '../../definicao-escopo/model/error-api';
import { Select, Store } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../state/definicao-escopo-grupo-tecnico.state';
import { GrupoItemTecnico } from '../models/grupo-item';
import { FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, shareReplay, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { trackByFactory } from '@aw-utils/track-by';
import { OrderByType } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import {
  getGrupoItemFiltrosComboBoxArray,
  GrupoItemFiltro,
  GrupoItemFiltroEnum,
} from '../../definicao-escopo/shared/de-grupo-item-filtro.pipe';
import { DefinicaoEscopoGrupoTecnicoService } from '../definicao-escopo-grupo-tecnico.service';
import { getGrupoItemOrdemComboArray, GrupoItemOrdem } from '../../definicao-escopo/shared/grupo-item-ordem';
import { Destroyable } from '@aw-shared/components/common/destroyable-component';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';

@Component({
  selector: 'app-del-grupo-item-list',
  templateUrl: './det-grupo-item-list.component.html',
  styleUrls: ['./det-grupo-item-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetGrupoItemListComponent extends Destroyable implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private definicaoEscopoGrupoTecnicoService: DefinicaoEscopoGrupoTecnicoService,
    private orcamentoAltService: OrcamentoAltService
  ) {
    super();
  }

  @Select(DefinicaoEscopoGrupoTecnicoState.getErrorApi) errorApi$: Observable<ErrorApi>;
  grupoItens$: Observable<GrupoItemTecnico[]>;
  @Select(DefinicaoEscopoGrupoTecnicoState.getOpeningAll) openingAll$: Observable<boolean>;
  @Select(DefinicaoEscopoGrupoTecnicoState.getIsAnyOpened) isAnyOpened$: Observable<boolean>;
  @Select(DefinicaoEscopoGrupoTecnicoState.getIsAllOpened) isAllOpened$: Observable<boolean>;

  listOrder = getGrupoItemOrdemComboArray<GrupoItemTecnico>();
  listFilter = getGrupoItemFiltrosComboBoxArray();

  formPesquisa = this.formBuilder.group({
    search: null,
    order:
      this.listOrder.find(order => order.key === this.definicaoEscopoGrupoTecnicoService.grupo.ordem) ??
      this.listOrder[0],
    filter:
      this.listFilter.find(filtro => filtro.key === this.definicaoEscopoGrupoTecnicoService.grupo.filtro) ??
      this.listFilter[0],
  });

  trackByGrupoItem = trackByFactory<GrupoItemTecnico>('idOrcamentoGrupoItem', 'idGrupoItem');

  ngOnInit(): void {
    const search$: Observable<string> = this.formPesquisa
      .get('search')
      .valueChanges.pipe(startWith(''), debounceTime(400), shareReplay());
    const filter$: Observable<GrupoItemFiltroEnum> = this.formPesquisa.get('filter').valueChanges.pipe(
      startWith(this.formPesquisa.value.filter as GrupoItemFiltro),
      map(o => o.key),
      shareReplay()
    );
    const order$: Observable<OrderByType<GrupoItemTecnico>> = this.formPesquisa.get('order').valueChanges.pipe(
      startWith(this.formPesquisa.value.order as GrupoItemOrdem),
      map(o => o.order),
      shareReplay()
    );
    this.grupoItens$ = combineLatest([filter$, order$, search$]).pipe(
      switchMap(([filter, order, term]) =>
        this.store.select(DefinicaoEscopoGrupoTecnicoState.getGrupoItensFiltered(order, filter, term))
      ),
      shareReplay()
    );
    this.formPesquisa.valueChanges
      .pipe(
        map(form => ({ ordem: form.order.key, filtro: form.filter.key })),
        distinctUntilChanged(
          (payloadA, payloadB) => payloadA.filtro === payloadB.filtro && payloadA.ordem === payloadB.ordem
        ),
        takeUntil(this.destroy$),
        tap(payload => {
          this.definicaoEscopoGrupoTecnicoService.grupo = {
            ...this.definicaoEscopoGrupoTecnicoService.grupo,
            filtro: payload.filtro,
            ordem: payload.ordem,
          };
        }),
        switchMap(payload =>
          this.orcamentoAltService.putFiltroOrdem(
            this.definicaoEscopoGrupoTecnicoService.grupo.idOrcamentoGrupo,
            payload.filtro,
            payload.ordem
          )
        )
      )
      .subscribe();
  }

  toggleAllAtivos(open = true): void {
    this.definicaoEscopoGrupoTecnicoService.toggleAllAtivos(open);
  }
}
