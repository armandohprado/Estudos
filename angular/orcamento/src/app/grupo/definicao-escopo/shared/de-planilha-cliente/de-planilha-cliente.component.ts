import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { StateComponent } from '@aw-shared/components/common/state-component';
import { PlanilhaClienteFiltro, PlanilhaClienteItem } from '@aw-models/planilha-cliente';
import { PlanilhaClienteService } from '@aw-services/planilha-cliente/planilha-cliente.service';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  pluck,
  startWith,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { combineLatest, Observable, of } from 'rxjs';
import { trackByFactory } from '@aw-utils/track-by';
import { catchAndThrow, findArray, refresh, refreshMap } from '@aw-utils/rxjs/operators';
import { AwModalService } from '@aw-services/core/aw-modal-service';
import { first, tail } from 'lodash-es';

interface DePlanilhaClienteState {
  loadingItens: boolean;
  loadingInicial: boolean;
  loadingModal: boolean;
  loadingDelete: boolean;
  loadingAssociado: boolean;
  filtros: PlanilhaClienteFiltro[];
  items: PlanilhaClienteItem[];
  idOrcamentoGrupoItem: number;
  idOrcamento: number;
}

@Component({
  selector: 'app-de-planilha-cliente',
  templateUrl: './de-planilha-cliente.component.html',
  styleUrls: ['./de-planilha-cliente.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DePlanilhaClienteComponent extends StateComponent<DePlanilhaClienteState> implements OnInit, OnDestroy {
  constructor(private planilhaClienteService: PlanilhaClienteService, private awModalService: AwModalService) {
    super(
      {
        loadingItens: false,
        loadingInicial: false,
        filtros: [],
        items: [],
        loadingAssociado: false,
        loadingModal: false,
        loadingDelete: false,
        idOrcamentoGrupoItem: 0,
        idOrcamento: 0,
      },
      { inputs: ['idOrcamentoGrupoItem', 'idOrcamento'] }
    );
  }

  private _hasAnyUpdate = false;

  @Input() idOrcamento: number;
  @Input() idOrcamentoGrupoItem: number;

  @Output() destroyHasUpdates = new EventEmitter();

  idOrcamentoGrupoItem$ = this.selectState('idOrcamentoGrupoItem');
  filtros$ = this.selectState('filtros');
  firstFiltro$: Observable<PlanilhaClienteFiltro> = this.filtros$.pipe(map(first));
  filtrosWithoutFirst$: Observable<PlanilhaClienteFiltro[]> = this.filtros$.pipe(map(tail));
  filtroAtivo$ = this.filtros$.pipe(findArray(filtro => filtro.selecionado));
  itemAssociado$ = this.idOrcamentoGrupoItem$.pipe(
    switchMap(idOrcamentoGrupoItem => this.planilhaClienteService.selectSelecionado(idOrcamentoGrupoItem))
  );
  itens$: Observable<PlanilhaClienteItem[]> = combineLatest([this.selectState('items'), this.itemAssociado$]).pipe(
    map(([items, itemAssociado]) => items.map(item => ({ ...item, selecionado: item.id === itemAssociado?.id })))
  );
  loading$ = this.selectState(['loadingModal', 'loadingAssociado', 'loadingItens', 'loadingInicial', 'loadingDelete']);

  termoControl = new FormControl('');

  trackByFiltro = trackByFactory<PlanilhaClienteFiltro>('id');
  trackByPlanilhaClienteItem = trackByFactory<PlanilhaClienteItem>('id');

  urlPlanilhaCliente$ = this.selectState('idOrcamento').pipe(
    map(idOrcamento => this.planilhaClienteService.getUrlPlanilhaClienteLegado(idOrcamento))
  );

  async openModalItemsRelacionados(planilhaClienteItem: PlanilhaClienteItem): Promise<void> {
    this.updateState({ loadingModal: true });
    await this.awModalService.showLazy(
      () =>
        import(
          './de-planilha-cliente-items-relacionados-modal/de-planilha-cliente-items-relacionados-modal.component'
        ).then(c => c.DePlanilhaClienteItemsRelacionadosModalComponent),
      { initialState: { planilhaClienteItem } }
    );
    this.updateState({ loadingModal: false });
  }

  selecionarFiltro(id: number): void {
    this.updateState('filtros', filtros => filtros.map(filtro => ({ ...filtro, selecionado: filtro.id === id })));
  }

  selecionarItem(item: PlanilhaClienteItem): void {
    this._hasAnyUpdate = true;
    this.updateState({ loadingAssociado: true });
    this.planilhaClienteService
      .associarOrcamentoGrupoItem(item, this.idOrcamento, {
        idPlanilhaClienteItem: item.id,
        idOrcamentoGrupoItem: this.idOrcamentoGrupoItem,
      })
      .pipe(
        finalize(() => {
          this.updateState({ loadingAssociado: false });
          this.planilhaClienteService.refresh();
        })
      )
      .subscribe();
  }

  deleteItem(itemAssociado: PlanilhaClienteItem): void {
    this._hasAnyUpdate = true;
    this.updateState({ loadingDelete: true });
    this.planilhaClienteService
      .deletarPlanilhaClienteItemOrcamentoGrupoItem(itemAssociado.idPlanilhaClienteItemOrcamentoGrupoItem)
      .pipe(
        finalize(() => {
          this.updateState({ loadingDelete: false });
          this.planilhaClienteService.refresh();
        })
      )
      .subscribe();
  }

  private _execBusca(nivel: number, termo: string): Observable<PlanilhaClienteItem[]> {
    return this.planilhaClienteService.buscarItens(this.idOrcamento, this.idOrcamentoGrupoItem, nivel, termo).pipe(
      tap(items => {
        this.updateState({ items });
      })
    );
  }

  initSub(): void {
    const idFiltroAtivo$ = this.filtroAtivo$.pipe(pluck('id'), distinctUntilChanged());
    const termo$ = (this.termoControl.valueChanges as Observable<string>).pipe(
      startWith(''),
      debounceTime(300),
      tap(termo => {
        if (termo.length < 3) {
          this.updateState({ items: [] });
        }
      })
    );
    const filtros$ = combineLatest([idFiltroAtivo$, termo$]);
    filtros$
      .pipe(
        takeUntil(this.destroy$),
        filter(([, termo]) => termo.length >= 3),
        switchMap(([nivel, termo]) => {
          this.updateState({ loadingItens: true });
          return this._execBusca(nivel, termo).pipe(
            finalize(() => {
              this.updateState({ loadingItens: false });
            })
          );
        }),
        catchAndThrow(() => {
          this.initSub();
        })
      )
      .subscribe();
    this.planilhaClienteService.refreshComponent$
      .pipe(
        takeUntil(this.destroy$),
        startWith(-1),
        tap(value => {
          if (value !== -1) {
            this._hasAnyUpdate = true;
          }
        }),
        refresh(this.planilhaClienteService.buscarItemAssociadoOrcamentoGrupoItem(this.idOrcamentoGrupoItem)),
        withLatestFrom(filtros$),
        refreshMap(([, [nivel, termo]]) => {
          if (termo?.length >= 3) {
            return this._execBusca(nivel, termo);
          }
          return of(null);
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.initSub();
    this.updateState({ loadingInicial: true });
    this.planilhaClienteService
      .buscarFiltros(this.idOrcamento)
      .pipe(
        tap(filtros => {
          this.updateState({ filtros });
        }),
        finalize(() => {
          this.updateState({ loadingInicial: false });
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this._hasAnyUpdate) {
      this.destroyHasUpdates.emit();
    }
  }
}
