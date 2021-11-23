import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GrupoItemDE } from '../model/grupo-item';
import { DefinicaoEscopoService } from '../definicao-escopo.service';
import { Select } from '@ngxs/store';
import { DefinicaoEscopoState } from '../state/definicao-escopo.state';
import { Observable, switchMap, tap } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { ErrorApi } from '../model/error-api';
import { FormControl, FormGroup } from '@angular/forms';
import { trackByFactory } from '@aw-utils/track-by';
import { getGrupoItemFiltrosComboBoxArray } from '../shared/de-grupo-item-filtro.pipe';
import { getGrupoItemOrdemComboArray } from '../shared/grupo-item-ordem';
import { Destroyable } from '@aw-shared/components/common/destroyable-component';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';

@Component({
  selector: 'app-de-grupo-item-list',
  templateUrl: './de-grupo-item-list.component.html',
  styleUrls: ['./de-grupo-item-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeGrupoItemListComponent extends Destroyable implements OnInit {
  constructor(public definicaoEscopoService: DefinicaoEscopoService, private orcamentoAltService: OrcamentoAltService) {
    super();
  }

  @Input() gruposItens: GrupoItemDE[];

  readonly listOrder = getGrupoItemOrdemComboArray<GrupoItemDE>();
  readonly listFilter = getGrupoItemFiltrosComboBoxArray();

  @Select(DefinicaoEscopoState.getLoading) readonly loading$: Observable<boolean>;
  @Select(DefinicaoEscopoState.getErrorApi) readonly errorApi$: Observable<ErrorApi>;
  @Select(DefinicaoEscopoState.getOpeningAll) readonly openingAll$: Observable<boolean>;
  @Select(DefinicaoEscopoState.getIsAnyOpened) readonly isAnyOpened$: Observable<boolean>;
  @Select(DefinicaoEscopoState.getIsAllOpened) readonly isAllOpened$: Observable<boolean>;

  readonly trackByGrupoItem = trackByFactory<GrupoItemDE>('idOrcamentoGrupoItem', 'idGrupoItem');

  readonly formPesquisa = new FormGroup({
    search: new FormControl(),
    order: new FormControl(
      this.listOrder.find(ordem => ordem.key === this.definicaoEscopoService.grupo.ordem) ?? this.listOrder[0]
    ),
    filter: new FormControl(
      this.listFilter.find(filtro => filtro.key === this.definicaoEscopoService.grupo.filtro)?.key ??
        this.listFilter[0]?.key
    ),
  });

  readonly search$: Observable<string> = this.formPesquisa.get('search').valueChanges.pipe(debounceTime(400));

  get orderControl(): FormControl {
    return this.formPesquisa.get('order') as FormControl;
  }

  get searchControl(): FormControl {
    return this.formPesquisa.get('search') as FormControl;
  }

  get filterControl(): FormControl {
    return this.formPesquisa.get('filter') as FormControl;
  }

  toggleAllAtivos(open = true): void {
    this.definicaoEscopoService.toggleAllAtivos(open);
  }

  ngOnInit(): void {
    this.formPesquisa.valueChanges
      .pipe(
        map(form => ({ ordem: form.order.key, filtro: form.filter })),
        distinctUntilChanged(
          (payloadA, payloadB) => payloadA.filtro === payloadB.filtro && payloadA.ordem === payloadB.ordem
        ),
        takeUntil(this.destroy$),
        tap(payload => {
          this.definicaoEscopoService.grupo = {
            ...this.definicaoEscopoService.grupo,
            filtro: payload.filtro,
            ordem: payload.ordem,
          };
        }),
        switchMap(payload =>
          this.orcamentoAltService.putFiltroOrdem(
            this.definicaoEscopoService.grupo.idOrcamentoGrupo,
            payload.filtro,
            payload.ordem
          )
        )
      )
      .subscribe();
  }
}
