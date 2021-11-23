import { Directive, EventEmitter, Host, Inject, Input, Output, Self } from '@angular/core';
import { WorksheetAbstract } from '@aw-utils/excel/worksheet-abstract';
import { WorksheetComponent } from '@grapecity/spread-sheets-angular';
import { CheckListIntegradoComponent } from '../check-list-integrado.component';
import { CliFuncao } from '@aw-models/funcao';
import { Spread } from '@grapecity/spread-sheets';
import { ObraFase, ObraFasePeriodo, ObraFasePeriodoAtualizarPayload } from '@aw-models/obra-fase';
import { ColDef } from '@aw-utils/excel/excel';
import { SpreadjsHelper } from '@aw-utils/excel/spreadjs-helper';
import { resolvePredicates } from '../util';
import { isFunction, isNil, roundNumber, upsert } from '@aw-utils/utils';
import { BehaviorSubject, concat, Observable } from 'rxjs';
import { debounceTime, filter, finalize, mapTo, switchMap, takeUntil, tap } from 'rxjs/operators';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { CliObraFaseService } from './cli-obra-fase.service';
import { WINDOW_TOKEN } from '../../tokens/window';

@Directive({
  selector: 'gc-worksheet[appCliObraFase]',
  providers: [{ provide: WorksheetAbstract, useExisting: CliObraFaseDirective }],
})
export class CliObraFaseDirective extends WorksheetAbstract {
  constructor(
    @Self() worksheetComponent: WorksheetComponent,
    @Host() private checkListIntegradoComponent: CheckListIntegradoComponent,
    @Inject(WINDOW_TOKEN) private window: Window,

    private cliObraFaseService: CliObraFaseService
  ) {
    super(worksheetComponent);
  }

  private _fila$ = new BehaviorSubject<ObraFasePeriodoAtualizarPayload[]>([]);
  private _publicando = false;
  private _salvando = 0;

  @Input() funcao!: CliFuncao;
  @Input() rowStart!: number;
  @Input() obraFase!: ObraFase;
  @Output() readonly obraFaseChange = new EventEmitter<ObraFase>();

  helper!: SpreadjsHelper<ObraFasePeriodo>;

  colDefs: ColDef<ObraFasePeriodo>[] = [
    {
      id: '_id',
      visible: false,
    },
    {
      id: 'dataInicio',
      title: 'DATA INÍCIO',
      formatter: this.checkListIntegradoComponent.formatter.date,
      hAlign: Spread.Sheets.HorizontalAlign.center,
    },
    {
      id: 'dataFim',
      title: 'DATA FIM',
      formatter: this.checkListIntegradoComponent.formatter.date,
      hAlign: Spread.Sheets.HorizontalAlign.center,
    },
    {
      id: 'execucaoPrevistaInicial',
      title: 'EXECUÇÃO\nPREVISTA\nINICIAL',
      formatter: this.checkListIntegradoComponent.formatter.percent,
      locked: true,
      backColor:           this.checkListIntegradoComponent.color.notEditable,
    },
    {
      id: 'execucaoPrevistaAcumuladaInicial',
      title: 'EXECUÇÃO\nPREV.ACUM\nINICIAL',
      formatter: this.checkListIntegradoComponent.formatter.percent,
      locked: true,
      backColor:          this.checkListIntegradoComponent.color.notEditable,
    },
    {
      id: 'execucaoPrevistaTemporario',
      title: 'EXECUÇÃO\nPREVISTA',
      formatter: this.checkListIntegradoComponent.formatter.percent,
      locked: () => this._isLocked(),
      backColor: () =>
        this._isLocked()
          ? this.checkListIntegradoComponent.color.notEditable
          : this.checkListIntegradoComponent.color.white,
    },
    {
      id: 'execucaoPrevistaAcumuladaTemporario',
      title: 'EXECUÇÃO\nPREVISTA\nACUMULADA',
      formatter: this.checkListIntegradoComponent.formatter.percent,
      formula: ({ item }) => {
        const colDefExecucaoPrevista = this.helper.colDefsMap.get('execucaoPrevistaTemporario');
        if (!colDefExecucaoPrevista) {
          return;
        }
        const letterExecucaoPrevista = colDefExecucaoPrevista.letter;
        const firstRow = this.rowStart + 2;
        return `=SUM(${letterExecucaoPrevista}${firstRow}:${letterExecucaoPrevista}${item._row + 1})`;
      },
      validator: Spread.Sheets.DataValidation.createNumberValidator(
        Spread.Sheets.ConditionalFormatting.ComparisonOperators.between,
        0,
        100,
        false
      )
        .showErrorMessage(true)
        .errorMessage('Valor precisa estar entre 0 e 100')
        .highlightStyle({
          type: Spread.Sheets.DataValidation.HighlightType.icon,
          color: 'red',
          position: Spread.Sheets.DataValidation.HighlightPosition.topLeft,
        }),
    },
    {
      id: 'execucaoRealizada',
      title: 'EXECUÇÃO\nREALIZADA',
      formatter: this.checkListIntegradoComponent.formatter.percent,
    },
    {
      id: 'execucaoRealizadaAcumulada',
      title: 'EXECUÇÃO\nREALIZADA\nACUMULADA',
      formatter: this.checkListIntegradoComponent.formatter.percent,
    },
  ];

  private _watchFila(): void {
    this._fila$
      .pipe(
        debounceTime(1000),
        takeUntil(this._destroy$),
        filter(payloads => !!payloads.length),
        switchMap(payloads => {
          this._fila$.next([]);
          return this._atualizarObraFasePeriodos(payloads);
        }),
        catchAndThrow(() => {
          alert('Ocorreu um erro ao tentar salvar as últimas alterações');
          this._watchFila();
        })
      )
      .subscribe();
  }

  private _atualizarObraFasePeriodo(payload: ObraFasePeriodoAtualizarPayload): Observable<void> {
    return this.cliObraFaseService.put(payload).pipe(
      mapTo(void 0),
      tap(() => {
        this._updatePeriodo(payload.idObraFasePeriodo, periodo => ({
          ...periodo,
          execucaoPrevista: periodo.execucaoPrevistaTemporario,
          execucaoPrevistaAcumulada: periodo.execucaoPrevistaAcumuladaTemporario,
        }));
      })
    );
  }

  private _atualizarObraFasePeriodos(payloads: ObraFasePeriodoAtualizarPayload[]): Observable<void> {
    this._salvando++;
    this._redrawBtnPublicar();
    return concat(...payloads.map(payload => this._atualizarObraFasePeriodo(payload))).pipe(
      finalize(() => {
        this._salvando = Math.max(this._salvando - 1, 0);
        this._redrawBtnPublicar();
      })
    );
  }

  private _updateFila(payload: ObraFasePeriodoAtualizarPayload): void {
    this._fila$.next(upsert(this._fila$.value, payload, 'idObraFasePeriodo'));
  }

  private _isLocked(): boolean {
    return !this.obraFase.alteraPercentual  || this.obraFase._funcao !== this.funcao;
  }

  private _updateObraFase(partial: Partial<ObraFase> | ((obraFase: ObraFase) => ObraFase)): void {
    const update = isFunction(partial) ? partial : (obraFase: ObraFase) => ({ ...obraFase, ...partial });
    this.obraFase = update(this.obraFase);
    this.obraFaseChange.emit(this.obraFase);
  }

  private _updatePeriodo(
    _id: number | ((periodo: ObraFasePeriodo) => boolean),
    partial: Partial<ObraFasePeriodo> | ((periodo: ObraFasePeriodo) => ObraFasePeriodo)
  ): void {
    const { predicate, update } = resolvePredicates(_id, partial);
    this._updateObraFase(obraFase => ({
      ...obraFase,
      obraFasePeriodo: obraFase.obraFasePeriodo.map(periodo => {
        if (predicate(periodo)) {
          periodo = update(periodo);
        }
        return periodo;
      }),
    }));
  }

  private _setRowsToData(): number {
    let row = this.rowStart;
    this._updateObraFase(obraFase => ({
      ...obraFase,
      obraFasePeriodo: obraFase.obraFasePeriodo.map(periodo => ({ ...periodo, _row: ++row })),
    }));
    return row + 1;
  }

  private _toggleEditState(): void {
    this.helper.executeSuspended(
      () => {
        this._updateObraFase(obraFase => ({ ...obraFase, alteraPercentual: !obraFase.alteraPercentual }));
        const colDef = this.helper.colDefsMap.get('execucaoPrevistaTemporario');
        if (!colDef) {
          return;
        }
        for (const periodo of this.obraFase.obraFasePeriodo) {
          this.helper.setCell(periodo._row, colDef, periodo);
        }
        this._redrawBtnPublicar();
        this._redrawBtnEditar();
      },
      { paint: true, event: true }
    );
  }

  private _editarBtnClicked(): void {
    this.cliObraFaseService.liberarEdicao(this.obraFase.idObraFase).subscribe();
    this._toggleEditState();
  }

  private _publicarBtnClicked(): void {
    if (this._publicando) {
      return;
    }
    this._publicando = true;
    this._toggleEditState();
    const requests: Observable<any>[] = [];
    if (this._fila$.value.length) {
      const payloads = this._fila$.value;
      this._fila$.next([]);
      requests.push(...payloads.map(payload => this._atualizarObraFasePeriodo(payload)));
    }
    const publicar$ = this.cliObraFaseService.publicar(this.obraFase.idObraFase).pipe(
      catchAndThrow(() => {
        alert('Não foi possível publicar. Verifique se a execução prevista acumulada está totalizando 100%');
      })
    );
    concat(...requests, publicar$)
      .pipe(
        finalize(() => {
          this._publicando = false;
          this._redrawBtnEditar();
          if (!this.obraFase.dataPublicacao) {
            this.window.location.reload()
          }
        })
      )
      .subscribe();
  }

  private _setHeader(): void {
    this.checkListIntegradoComponent.montarCabecalho(this.sheet, this.colCount);
    this.sheet.removeSpan(0, 1);
    this.sheet.addSpan(0, 1, 1, 5);
    this.sheet.removeSpan(2, 1);
    this.sheet.addSpan(2, 1, 1, 5);
    this.sheet.addSpan(2, 1, 1, 5);

    const enabled = this.funcao === this.obraFase._funcao;
    const cell = this.sheet.getCell(0, 6).text('').cellButtons(this._getEditarBtn()).locked(false);
    const cellPublicar = this.sheet.getCell(2, 6).text('').cellButtons(this._getPublicarBtn()).locked(false);
    if (!enabled) {
      cell.comment(new Spread.Sheets.Comments.Comment(`Somente ${this.obraFase._funcao} pode editar`));
      cellPublicar.comment(new Spread.Sheets.Comments.Comment(`Somente ${this.obraFase._funcao} pode publicar`));
    }
    const rowSeparator = 3;
    this.sheet.addSpan(rowSeparator, 1, 1, this.colCount);
    const rowObjetivo = rowSeparator + 1;
    this.sheet.addSpan(rowObjetivo, 1, 1, this.colCount);
    this.sheet
      .getCell(rowObjetivo, 1)
      .value(
        'Objetivo: Nesta tela é possível replanejar os % previstos! Os Percentuais Realizados são preenchidos pelo GI no controle de obra do projeto.'
      )
      .wordWrap(true);
    this.sheet.autoFitRow(rowObjetivo);
    let row = rowObjetivo + 1;
    const informacoes = [
      '1. Só será possível publicar quando o percentual acumulado chegar a 100%',
      '2. Não sera possível alterar % de semanas onde os relatórios já foram enviados',
    ];
    for (const informacao of informacoes) {
      this.sheet.addSpan(row, 1, 1, this.colCount);
      this.sheet.getCell(row, 1).value(informacao).wordWrap(true).cellPadding('0 16');
      this.sheet.autoFitRow(row);
      row++;
    }
    this.sheet.addSpan(row, 1, 1, this.colCount);
    // merge dos botões para caso aumente as colunas novamente
    this.sheet.addSpan(2, 6, 1, 8);
    this.sheet.addSpan(0, 6, 1, 8);

  }

  private _getEditarBtn(): Spread.Sheets.ICellButton[] {
    return [
      {
        enabled: this.funcao === this.obraFase._funcao && !this._publicando && !this.obraFase.alteraPercentual,
        caption: 'Editar %',
        useButtonStyle: true,
        position: Spread.Sheets.ButtonPosition.left,
        width: 120,
        command: () => this._editarBtnClicked(),
      },
    ];
  }

  private _getPublicarBtn(): Spread.Sheets.ICellButton[] {
    const lastRow = this.obraFase.obraFasePeriodo[this.obraFase.obraFasePeriodo.length - 1]._row;
    const colDefExecucaoPrevistaAcumuladaTemporario = this.helper.colDefsMap.get('execucaoPrevistaAcumuladaTemporario');
    const lastExecucaoPrevistaAcumuladaTemporario = roundNumber(
      this.sheet.getCell(lastRow, colDefExecucaoPrevistaAcumuladaTemporario?.col ?? -1)?.value() ?? 0
    );
    return [
      {
        enabled:
          !this._salvando &&
          !this._publicando &&
          this.obraFase.alteraPercentual &&
          this.funcao === this.obraFase._funcao &&
          lastExecucaoPrevistaAcumuladaTemporario === 100,
        caption: 'Publicar %',
        useButtonStyle: true,
        position: Spread.Sheets.ButtonPosition.left,
        width: 120,
        command: () => this._publicarBtnClicked(),
      },
    ];
  }

  private _redrawBtnEditar(): void {
    if (this.funcao !== this.obraFase._funcao) {
      return;
    }
    this.sheet.getCell(0, 6).cellButtons(this._getEditarBtn());
  }

  private _redrawBtnPublicar(): void {
    if (this.funcao !== this.obraFase._funcao) {
      return;
    }
    this.sheet.getCell(2, 6).cellButtons(this._getPublicarBtn());
  }

  private _setRows(): void {
    const rows = this._setRowsToData();
    this.sheet.setRowCount(rows);
    this.checkListIntegradoComponent.setColTitles(this.helper, this.rowStart);
    this.sheet.autoFitRow(this.rowStart);
    for (const periodo of this.obraFase.obraFasePeriodo) {
      this.helper.setRow(periodo._row, periodo);
    }
    this._watchFila();
  }

  private _getItemByRow(row: number): ObraFasePeriodo | undefined {
    const idCell = this.sheet.getCell(row, 0);
    const id = idCell?.value();
    if (isNil(id)) {
      return;
    }
    return this.obraFase.obraFasePeriodo.find(periodo => periodo._id === id);
  }

  private _changed(row: number, col: number, newValue?: any): void {
    const oldItem = this._getItemByRow(row);
    if (isNil(oldItem)) {
      return;
    }
    const colDef = this.helper.colDefsMap.get(col);
    if (!colDef) {
      return;
    }
    const property = colDef.id;
    if (!property) {
      return;
    }
    const cellValue = this.sheet.getCell(row, col);
    newValue ??= cellValue.value();
    if (oldItem[property] === newValue) {
      cellValue.value(newValue);
      return;
    }
    this.sheet.autoFitRow(row);
    const atualizacaoItem: Partial<ObraFasePeriodo> = { [property]: newValue };
    for (const colDefFormula of this.helper.colDefs.filter(cd => cd.formula)) {
      atualizacaoItem[colDefFormula.id!] = this.sheet.getCell(row, colDefFormula.col!).value();
    }
    const periodo: ObraFasePeriodo = { ...oldItem, ...atualizacaoItem };
    this._updatePeriodo(periodo._id, atualizacaoItem);
    if (property === 'execucaoPrevistaTemporario') {
      this._updateFila({
        idObraFasePeriodo: periodo.idObraFasePeriodo,
        execucaoPrevistaTemporario: periodo.execucaoPrevistaTemporario,
      });
      this._redrawBtnPublicar();
    }
  }

  clipboardPasted({ cellRange: { col, colCount, rowCount, row } }: Spread.Sheets.IClipboardPastedEventArgs): void {
    for (let i = 0; i < colCount; i++) {
      const colI = col + i;
      for (let j = 0; j < rowCount; j++) {
        const rowI = row + j;
        this._changed(rowI, colI);
      }
    }
  }

  editEnded({ row, col }: Spread.Sheets.IEditEndedEventArgs): void {
    this._changed(row, col);
  }

  cellChanged($event: Spread.Sheets.ICellChangedEventArgs): void {
    const item = this._getItemByRow($event.row);
    if (!item) {
      return;
    }
    const colDef = this.helper.colDefsMap.get($event.col);
    if (colDef?.datePicker || this.helper.resolveTimepicker($event.row, $event.col, item) || colDef?.customCellType) {
      this._changed($event.row, $event.col);
    }
  }

  deleteChanged(row: number, col: number): void {
    const item = this._getItemByRow(row);
    if (!item) {
      return;
    }
    this.helper.checkDefaulValue(row, col);
    this._changed(row, col);
  }

  init(workbook: Spread.Sheets.Workbook): void {
    this.helper = new SpreadjsHelper(this.sheet, {
      colDefs: this.colDefs,
      idProperty: 'idObraFasePeriodo',
      autoFitRows: true,
      colDefDefault: this.checkListIntegradoComponent.defaultColDef,
    });
    this.helper.executeSuspended(
      () => {
        this._setRows();
        this._setHeader();
      },
      { event: true, paint: true }
    );
    super.init(workbook);
  }
}
