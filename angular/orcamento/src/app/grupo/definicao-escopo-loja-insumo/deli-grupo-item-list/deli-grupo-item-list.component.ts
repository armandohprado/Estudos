import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { ErrorApi } from '../../definicao-escopo/model/error-api';
import { Select } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../state/definicao-escopo-loja-insumo.state';
import { GrupoItemDELI } from '../models/grupo-item';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, shareReplay, startWith, takeUntil } from 'rxjs/operators';
import { OrderByType } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { trackByFactory } from '@aw-utils/track-by';
import {
  getGrupoItemFiltrosComboBoxArray,
  GrupoItemFiltroEnum,
} from '../../definicao-escopo/shared/de-grupo-item-filtro.pipe';
import { DefinicaoEscopoLojaInsumoService } from '../definicao-escopo-loja-insumo.service';
import { getGrupoItemOrdemComboArray } from '../../definicao-escopo/shared/grupo-item-ordem';
import { Destroyable } from '@aw-shared/components/common/destroyable-component';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';

@Component({
  selector: 'app-del-grupo-item-list',
  templateUrl: './deli-grupo-item-list.component.html',
  styleUrls: ['./deli-grupo-item-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliGrupoItemListComponent extends Destroyable implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private definicaoEscopoLojaInsumoService: DefinicaoEscopoLojaInsumoService,
    private orcamentoAltService: OrcamentoAltService
  ) {
    super();
  }

  @Select(DefinicaoEscopoLojaInsumoState.getErrorApi) errorApi$: Observable<ErrorApi>;
  @Select(DefinicaoEscopoLojaInsumoState.getGrupoItens) grupoItens$: Observable<GrupoItemDELI[]>;
  @Select(DefinicaoEscopoLojaInsumoState.getOpeningAll) openingAll$: Observable<boolean>;
  @Select(DefinicaoEscopoLojaInsumoState.getIsAnyOpened) isAnyOpened$: Observable<boolean>;
  @Select(DefinicaoEscopoLojaInsumoState.getIsAllOpened) isAllOpened$: Observable<boolean>;

  formPesquisa: FormGroup;

  listOrder = getGrupoItemOrdemComboArray<GrupoItemDELI>();
  listFilter = getGrupoItemFiltrosComboBoxArray();

  search$: Observable<string>;
  order$: Observable<OrderByType<GrupoItemDELI>>;
  filter$: Observable<GrupoItemFiltroEnum>;

  trackByGrupoItem = trackByFactory<GrupoItemDELI>('idOrcamentoGrupoItem', 'idGrupoItem');

  ngOnInit(): void {
    this.formPesquisa = this.formBuilder.group({
      search: null,
      order:
        this.listOrder.find(ordem => ordem.key === this.definicaoEscopoLojaInsumoService.grupo.ordem) ??
        this.listOrder[0],
      filter:
        this.listFilter.find(filtro => filtro.key === this.definicaoEscopoLojaInsumoService.grupo.filtro) ??
        this.listFilter[0],
    });
    const { order, filter } = this.formPesquisa.value;
    this.search$ = this.formPesquisa.get('search').valueChanges.pipe(debounceTime(400), shareReplay());
    this.order$ = this.formPesquisa.get('order').valueChanges.pipe(
      startWith(order),
      map(o => o.order),
      shareReplay()
    );
    this.filter$ = this.formPesquisa.get('filter').valueChanges.pipe(
      startWith(filter),
      map(o => o.key),
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
          this.definicaoEscopoLojaInsumoService.grupo = {
            ...this.definicaoEscopoLojaInsumoService.grupo,
            filtro: payload.filtro,
            ordem: payload.ordem,
          };
        }),
        switchMap(payload =>
          this.orcamentoAltService.putFiltroOrdem(
            this.definicaoEscopoLojaInsumoService.grupo.idOrcamentoGrupo,
            payload.filtro,
            payload.ordem
          )
        )
      )
      .subscribe();
  }

  toggleAllAtivos(open = true): void {
    this.definicaoEscopoLojaInsumoService.toggleAllAtivos(open);
  }
}
