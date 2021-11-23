import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { CurvaAbcGrupo } from '@aw-models/curva-abc-grupo';
import { StateComponent } from '@aw-shared/components/common/state-component';
import { Order, orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { combineLatest, fromEvent, Observable } from 'rxjs';
import { auditTime, debounceTime, filter, map, startWith } from 'rxjs/operators';
import { isAfter, isBefore } from 'date-fns';
import { trackByFactory } from '@aw-utils/track-by';
import { SupplierRule } from '@aw-models/supplier-rule.enum';
import { Familia } from '@aw-models/familia';
import { getPositions } from '@aw-components/aw-filter/aw-filter.util';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { awSelectComparatorFactory } from '@aw-components/aw-select/aw-select.config';
import { sumCurvaABCGroupGoal } from '../sum-curva-abcgroup-goal.pipe';
import { inOutAnimation } from '@aw-shared/animations/inOut';
import { WINDOW_TOKEN } from '@aw-shared/tokens/window';
import { FilterCurvaAbc, filterCurvaAbc, getEstimatedValue } from '../helper';

export interface CurvaAbcFilterDatas {
  escopoEntregue: CurvaAbcFilterDataInternal;
  custoEntregue: CurvaAbcFilterDataInternal;
}

export interface CurvaAbcFilterDataInternal {
  emDia: boolean;
  atrasado: boolean;
  recebido: boolean;
}

interface CurvaAbcTableState {
  grupos: CurvaAbcGrupo[];
  sortKey: keyof CurvaAbcGrupo;
  sortDirection: Order;
  subTable: boolean;
  filterGrupo: string | null;
  filterFamilias: Familia[];
  filterDatas: CurvaAbcFilterDatas;
}

export interface CurvaAbcFiltroEvent {
  grupos: CurvaAbcGrupo[];
  totalFiltrado: number;
  firstChange: boolean;
}

@Component({
  selector: 'app-curva-abc-table',
  templateUrl: './curva-abc-table.component.html',
  styleUrls: ['./curva-abc-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [inOutAnimation],
  host: { class: 'table-responsive' },
})
export class CurvaAbcTableComponent extends StateComponent<CurvaAbcTableState> implements AfterViewInit, OnChanges {
  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    private scrollStrategyOptions: ScrollStrategyOptions,
    @Inject(WINDOW_TOKEN) private window: Window
  ) {
    super(
      {
        grupos: [],
        sortKey: 'valorConsiderado',
        sortDirection: 'desc',
        subTable: false,
        filterFamilias: [],
        filterGrupo: null,
        filterDatas: {
          escopoEntregue: { emDia: true, atrasado: true, recebido: true },
          custoEntregue: { emDia: true, atrasado: true, recebido: true },
        },
      },
      { inputs: ['grupos', 'subTable'] }
    );
  }

  private _firstChange = true;
  private _grupos$ = this.selectState('grupos');

  headerTable = [
    'codigoGrupo',
    'descricaoFamilia',
    'escopoEntregue',
    'custoEntregue',
    'valorSelecionado',
    'nomeFantasia',
    'estimatedValue',
    'totalValue',
    'collapse',
  ];

  expanded = 0;
  expandedGroup = 0;

  supplierRuleEnum = SupplierRule;
  familiasNotApplied: Familia[] = [];
  filterFamiliasSrollStrategy = this.scrollStrategyOptions.block();
  filterFamiliasPosition = getPositions('bottom');
  filterFamiliasOpen = false;

  sortKey$ = this.selectState('sortKey');
  sortDirection$ = this.selectState('sortDirection');
  filterGrupo$ = this.selectState('filterGrupo');
  filterFamilias$ = this.selectState('filterFamilias');
  filterGruposFamilias$: Observable<FilterCurvaAbc> = combineLatest([this.filterFamilias$, this.filterGrupo$]).pipe(
    map(([familias, grupo]) => ({ familias, grupo }))
  );
  filterDatas$ = this.selectState('filterDatas');
  filters$ = combineLatest([this.filterFamilias$, this.filterGrupo$, this.filterDatas$]);

  grupos$ = combineLatest([this._grupos$, this.sortKey$, this.sortDirection$, this.filters$]).pipe(
    // Filtra e ordena os grupos
    map(([grupos, sortKey, sortDirection, [filteFamilias, filterGrupo, filterDatas]]) => {
      // Filtra pelo campo
      let filtered = this._filterGrupos(grupos, filterDatas);
      // Filtra por grupo e pelas familias
      filtered = filterCurvaAbc(filtered, { familias: filteFamilias, grupo: filterGrupo });
      return orderBy(filtered, { [sortKey]: sortDirection, codigoGrupoInt: 'asc' });
    }),
    // Mapeia o total dos grupos
    map(grupos => {
      const total = this.totalEstimatedValue;
      grupos = grupos.map(grupo => ({ ...grupo, total: getEstimatedValue(grupo) / total }));
      this.filtroEvent.emit({
        grupos: grupos.filter(grupo => grupo.total > 0),
        totalFiltrado: sumCurvaABCGroupGoal(grupos).totalEstimatedValue,
        firstChange: this._firstChange,
      });
      this._firstChange = false;
      return grupos;
    })
  );

  // Inicializado no ngAfterViewInit
  tableHeaderElementsWidthMap$: Observable<Record<string, number>>;

  @ViewChildren('headerCellElement') cdkHeader: QueryList<ElementRef<HTMLTableHeaderCellElement>>;
  @Input() grupos: CurvaAbcGrupo[];
  @Input() idOrcamentoCenario: number;
  @Input() idProjeto: number;
  @Input() familias: Familia[];
  @Input() subTable = false;
  @Input() tableHeaderElementsWidthMap: Record<string, number> = {};
  @Input() totalEstimatedValue: number;

  @Output() readonly filtroEvent = new EventEmitter<CurvaAbcFiltroEvent>();
  @Output() readonly refreshOrcamento = new EventEmitter<void>();

  familiasComparator = awSelectComparatorFactory<Familia>('idOrcamentoFamilia');
  trackByFamilia = trackByFactory<Familia>('idOrcamentoFamilia');
  trackByCurvaAbcGrupo = trackByFactory<CurvaAbcGrupo>('idOrcamentoGrupo');

  private _filterGrupos(grupos: CurvaAbcGrupo[], filterData: CurvaAbcFilterDatas): CurvaAbcGrupo[] {
    const { custoEntregue, escopoEntregue } = filterData;
    if (!custoEntregue.emDia) {
      grupos = grupos.filter(
        item =>
          item.dataLimiteDefinicao && isAfter(new Date(), new Date(item.dataLimiteRecebimento)) && !item.escopoEntregue
      );
    }

    if (!custoEntregue.atrasado) {
      grupos = grupos.filter(
        item =>
          item.dataLimiteDefinicao && isBefore(new Date(), new Date(item.dataLimiteDefinicao)) && !item.escopoEntregue
      );

      if (!custoEntregue.recebido) {
        grupos = grupos.filter(item => !item.escopoEntregue);
      }
    }
    if (!escopoEntregue.emDia) {
      grupos = grupos.filter(
        item =>
          item.dataLimiteRecebimento && isAfter(new Date(), new Date(item.dataLimiteRecebimento)) && !item.custoEntregue
      );
    }

    if (!escopoEntregue.atrasado) {
      grupos = grupos.filter(
        item =>
          item.dataLimiteRecebimento &&
          isBefore(new Date(), new Date(item.dataLimiteRecebimento)) &&
          !item.custoEntregue
      );
    }
    if (!escopoEntregue.recebido) {
      grupos = grupos.filter(item => !item.custoEntregue);
    }
    return grupos;
  }

  filterData(filterBy: keyof CurvaAbcFilterDatas, key: keyof CurvaAbcFilterDataInternal, $event: boolean): void {
    this.updateState('filterDatas', filterData => ({
      ...filterData,
      [filterBy]: { ...filterData[filterBy], [key]: $event },
    }));
  }

  applySort(sortKey: keyof CurvaAbcGrupo, sortDirection: Order): void {
    this.updateState({ sortKey, sortDirection });
  }

  toggleCollapse(idOrcamentoGrupo: number): void {
    this.expanded = idOrcamentoGrupo === this.expanded ? 0 : idOrcamentoGrupo;
  }

  toggleCollaseGroup(idOrcamentoGrupo: number): void {
    this.expandedGroup = idOrcamentoGrupo === this.expandedGroup ? 0 : idOrcamentoGrupo;
  }

  updateFilter(partial: Partial<Pick<CurvaAbcTableState, 'filterFamilias' | 'filterGrupo'>>): void {
    this.updateState(partial);
  }

  toggleFamiliaOverlay(status?: boolean): void {
    this.filterFamiliasOpen = status ?? !this.filterFamiliasOpen;
    this.familiasNotApplied = [];
    this.changeDetectorRef.markForCheck();
  }

  ngAfterViewInit(): void {
    this.tableHeaderElementsWidthMap$ = combineLatest([
      (this.cdkHeader.changes as Observable<QueryList<ElementRef<HTMLTableHeaderCellElement>>>).pipe(
        debounceTime(5),
        startWith(this.cdkHeader)
      ),
      this.selectState('subTable'),
      fromEvent(this.window, 'resize').pipe(auditTime(200), startWith({})),
    ]).pipe(
      filter(([, subTable]) => !subTable),
      map(([headersRef]) => {
        const elements = headersRef.toArray().map(elementRef => elementRef.nativeElement);
        return elements.reduce(
          (accum, element) => ({ ...accum, [element.id]: element.getBoundingClientRect().width }),
          {}
        );
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }
}
