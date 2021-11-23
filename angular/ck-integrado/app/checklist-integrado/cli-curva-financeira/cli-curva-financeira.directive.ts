import { Directive, Host, Input, Self } from '@angular/core';
import { WorksheetAbstract } from '@aw-utils/excel/worksheet-abstract';
import { WorksheetComponent } from '@grapecity/spread-sheets-angular';
import { CheckListIntegradoComponent } from '../check-list-integrado.component';
import { CliFuncao } from '@aw-models/funcao';
import { Spread } from '@grapecity/spread-sheets';
import { ColDef } from '@aw-utils/excel/excel';
import { SpreadjsHelper } from '@aw-utils/excel/spreadjs-helper';
import { resolvePredicates } from '../util';
import { isFunction, isNil, roundNumber, upsert } from '@aw-utils/utils';
import { BehaviorSubject, concat, Observable } from 'rxjs';
import { debounceTime, filter, finalize, mapTo, switchMap, takeUntil, tap } from 'rxjs/operators';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { CliCurvaFinanceiraService } from './cli-curva-financeira.service';
import {
  CurvaFinanceira,
  CurvaFinanceiraPeriodo,
  CurvaFinanceiraPeriodoAtualizarPayload,
  DataCurvaFinanceira,
} from '@aw-models/curva-financeira';

@Directive({
  selector: 'gc-worksheet[appCliCurvaFinanceira]',
  providers: [{ provide: WorksheetAbstract, useExisting: CliCurvaFinanceiraDirective }],
})
export class CliCurvaFinanceiraDirective extends WorksheetAbstract {
  constructor(
    @Self() worksheetComponent: WorksheetComponent,
    @Host() private checkListIntegradoComponent: CheckListIntegradoComponent,
    private cliCurvaFinanceiraService: CliCurvaFinanceiraService
  ) {
    super(worksheetComponent);
  }

  private _isActivated = false;
  private _fila$ = new BehaviorSubject<CurvaFinanceiraPeriodoAtualizarPayload[]>([]);
  private _publicando = false;
  private _salvando = 0;

  @Input() funcao!: CliFuncao;
  @Input() idProjeto!: number;
  @Input() rowStart!: number;
  @Input() curvaFinanceira!: CurvaFinanceira;

  dataCurvaFinanceira!: DataCurvaFinanceira;

  helper!: SpreadjsHelper<CurvaFinanceiraPeriodo>;

  colDefs: ColDef<CurvaFinanceiraPeriodo>[] = [
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
      id: 'execucaoPrevistaTemporario',
      title: 'EXECUÇÃO\nPREVISTA',
      formatter: this.checkListIntegradoComponent.formatter.percent,
      locked: ({ item }) => this._isLocked(item),
      backColor: ({ item }) =>
        this._isLocked(item)
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
          return this._atualizarCurvaFinanceiraPeriodos(payloads);
        }),
        catchAndThrow(() => {
          alert('Ocorreu um erro ao tentar salvar as últimas alterações');
          this._watchFila();
        })
      )
      .subscribe();
  }

  private _atualizarCurvaFinanceiraPeriodo(payload: CurvaFinanceiraPeriodoAtualizarPayload): Observable<void> {
    return this.cliCurvaFinanceiraService.put(payload).pipe(
      mapTo(void 0),
      tap(() => {
        this._updatePeriodo(payload.idObraCurvaFinanceiraPeriodo, periodo => ({
          ...periodo,
          execucaoPrevista: periodo.execucaoPrevistaTemporario,
          execucaoPrevistaAcumulada: periodo.execucaoPrevistaAcumuladaTemporario,
        }));
      })
    );
  }

  private _atualizarCurvaFinanceiraPeriodos(payloads: CurvaFinanceiraPeriodoAtualizarPayload[]): Observable<void> {
    this._salvando++;
    this._redrawBtnPublicar();
    return concat(...payloads.map(payload => this._atualizarCurvaFinanceiraPeriodo(payload))).pipe(
      finalize(() => {
        this._salvando = Math.max(this._salvando - 1, 0);
        this._redrawBtnPublicar();
      })
    );
  }

  private _updateFila(payload: CurvaFinanceiraPeriodoAtualizarPayload): void {
    this._fila$.next(upsert(this._fila$.value, payload, 'idObraCurvaFinanceiraPeriodo'));
  }

  private _isLocked(item: CurvaFinanceiraPeriodo): boolean {
    return (
      !this.dataCurvaFinanceira.alteraPercentual ||
      (item.relatorioEnviado && this.dataCurvaFinanceira.congelado) ||
      this.curvaFinanceira._funcao !== this.funcao
    );
  }

  private _updateCurvaFinanceira(
    partial: Partial<DataCurvaFinanceira> | ((dataCurvaFinaceira: DataCurvaFinanceira) => DataCurvaFinanceira)
  ): void {
    const update = isFunction(partial)
      ? partial
      : (curvaFinanceira: DataCurvaFinanceira) => ({ ...curvaFinanceira, ...partial });
    this.dataCurvaFinanceira = update(this.dataCurvaFinanceira);
  }

  private _updatePeriodo(
    _id: number | ((periodo: CurvaFinanceiraPeriodo) => boolean),
    partial: Partial<CurvaFinanceiraPeriodo> | ((periodo: CurvaFinanceiraPeriodo) => CurvaFinanceiraPeriodo)
  ): void {
    const { predicate, update } = resolvePredicates(_id, partial);
    this._updateCurvaFinanceira(dataCF => ({
      ...dataCF,
      periodos: dataCF.periodos.map(periodo => {
        if (predicate(periodo)) {
          periodo = update(periodo);
        }
        return periodo;
      }),
    }));
  }

  private _setRowsToData(): number {
    let row = this.rowStart;
    this._updateCurvaFinanceira(dataCF => ({
      ...dataCF,
      periodos: dataCF.periodos.map(periodo => ({ ...periodo, _row: ++row })),
    }));
    return row + 1;
  }

  private _toggleEditState(): void {
    this.helper.executeSuspended(
      () => {
        this._updateCurvaFinanceira(dataCF => ({
          ...dataCF,
          alteraPercentual: !dataCF.alteraPercentual,
        }));

        const colDef = this.helper.colDefsMap.get('execucaoPrevistaTemporario');
        if (!colDef) {
          return;
        }
        for (const periodo of this.dataCurvaFinanceira.periodos) {
          this.helper.setCell(periodo._row, colDef, periodo);
        }
        this._redrawBtnPublicar();
        this._redrawBtnCongelar();
        this._redrawBtnEditar();
      },
      { paint: true, event: true }
    );
  }

  private _editarBtnClicked(): void {
    this.cliCurvaFinanceiraService.liberarEdicao(this.dataCurvaFinanceira.idObraCurvaFinanceira).subscribe();
    this._toggleEditState();
  }
  private _congelarBtnClicked(): void {
    this.cliCurvaFinanceiraService
      .congelar(this.dataCurvaFinanceira.idObraCurvaFinanceira)
      .pipe(
        tap(() => {
          this.cliCurvaFinanceiraService
            .getMedicao(this.idProjeto, this.curvaFinanceira.id)
            .pipe(
              tap(dataCF => {
                this._updateCurvaFinanceira(dataCF);
                this.helper.executeSuspended(
                  () => {
                    this._setRows();
                    this._setHeader();
                  },
                  { event: true, paint: true }
                );
              })
            )
            .subscribe();
        })
      )
      .subscribe();
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
      requests.push(...payloads.map(payload => this._atualizarCurvaFinanceiraPeriodo(payload)));
    }
    const publicar$ = this.cliCurvaFinanceiraService.publicar(this.dataCurvaFinanceira.idObraCurvaFinanceira).pipe(
      catchAndThrow(() => {
        alert('Não foi possível publicar. Verifique se a execução prevista acumulada está totalizando 100%');
      })
    );
    concat(...requests, publicar$)
      .pipe(
        finalize(() => {
          this._publicando = false;
          this._redrawBtnEditar();
        })
      )
      .subscribe();
  }

  private _setHeader(): void {
    this.checkListIntegradoComponent.montarCabecalho(this.sheet, this.colCount);
    this.sheet.removeSpan(0, 1);
    this.sheet.addSpan(0, 1, 1, 5);
    this.sheet.removeSpan(2, 1);
    this.sheet.addSpan(2, 1, 1, 3);

    this.sheet.getCell(2, 5).text('');
    const enabled = this.funcao === this.curvaFinanceira._funcao;
    const cell = this.sheet.getCell(0, 6).text('').cellButtons(this._getEditarBtn()).locked(false);
    const cellPublicar = this.sheet.getCell(2, 6).text('').cellButtons(this._getPublicarBtn()).locked(false);
    const cellCongelar = this.sheet.getCell(2, 4).text('').cellButtons(this._getCongelarBtn()).locked(false);
    if (!enabled) {
      cell.comment(new Spread.Sheets.Comments.Comment(`Somente ${this.curvaFinanceira._funcao} pode editar`));
      cellPublicar.comment(new Spread.Sheets.Comments.Comment(`Somente ${this.curvaFinanceira._funcao} pode publicar`));
      cellCongelar.comment(new Spread.Sheets.Comments.Comment(`Somente ${this.curvaFinanceira._funcao} pode publicar`));
    }

    const rowSeparator = 3;
    this.sheet.addSpan(rowSeparator, 1, 1, this.colCount);
    const rowObjetivo = rowSeparator + 1;
    this.sheet.addSpan(rowObjetivo, 1, 1, this.colCount);
    this.sheet
      .getCell(rowObjetivo, 1)
      .value(
        'Objetivo: Nesta tela é possivel planejar a Curva S Financeira da Obra quando as medições não puderem acompanhar a Curva S de Avanço Fisico da Obra. Os valores realizados serão preenchidos pelos Boletim de Medição.'
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
  }

  private _getEditarBtn(): Spread.Sheets.ICellButton[] {
    return [
      {
        enabled: !this._publicando && !this.dataCurvaFinanceira.alteraPercentual,
        caption: 'Editar %',
        useButtonStyle: true,
        position: Spread.Sheets.ButtonPosition.left,
        width: 120,
        command: () => this._editarBtnClicked(),
      },
    ];
  }
  private _getCongelarBtn(): Spread.Sheets.ICellButton[] {
    return [
      {
        enabled: !this.dataCurvaFinanceira.congelado && !this.dataCurvaFinanceira.alteraPercentual,
        caption: !this.dataCurvaFinanceira.congelado ? 'Congelar %' : 'Congelado',
        useButtonStyle: true,
        position: Spread.Sheets.ButtonPosition.left,
        width: 120,
        command: () => this._congelarBtnClicked(),
      },
    ];
  }

  private _getPublicarBtn(): Spread.Sheets.ICellButton[] {
    const lastRow = this.dataCurvaFinanceira.periodos[this.dataCurvaFinanceira.periodos.length - 1]._row;
    const colDefExecucaoPrevistaAcumuladaTemporario = this.helper.colDefsMap.get('execucaoPrevistaAcumuladaTemporario');
    const lastExecucaoPrevistaAcumuladaTemporario = roundNumber(
      this.sheet.getCell(lastRow, colDefExecucaoPrevistaAcumuladaTemporario?.col ?? -1)?.value() ?? 0
    );
    return [
      {
        enabled:
          !this._salvando &&
          !this._publicando &&
          this.dataCurvaFinanceira.alteraPercentual &&
          this.funcao === this.curvaFinanceira._funcao &&
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
    if (this.funcao !== this.curvaFinanceira._funcao) {
      return;
    }
    this.sheet.getCell(0, 6).cellButtons(this._getEditarBtn());
  }
  private _redrawBtnCongelar(): void {
    if (this.funcao !== this.curvaFinanceira._funcao) {
      return;
    }
    this.sheet.getCell(2, 4).cellButtons(this._getCongelarBtn());
  }

  private _redrawBtnPublicar(): void {
    if (this.funcao !== this.curvaFinanceira._funcao) {
      return;
    }
    this.sheet.getCell(2, 6).cellButtons(this._getPublicarBtn());
  }

  private _setRows(): void {
    const rows = this._setRowsToData();
    this.sheet.setRowCount(rows);
    this.checkListIntegradoComponent.setColTitles(this.helper, this.rowStart);
    this.sheet.autoFitRow(this.rowStart);
    for (const periodo of this.dataCurvaFinanceira.periodos) {
      this.helper.setRow(periodo._row, periodo);
    }
    this._watchFila();
  }

  private _getItemByRow(row: number): CurvaFinanceiraPeriodo | undefined {
    const idCell = this.sheet.getCell(row, 0);
    const id = idCell?.value();
    if (isNil(id)) {
      return;
    }
    return this.dataCurvaFinanceira.periodos.find(periodo => periodo._id === id);
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
    const atualizacaoItem: Partial<CurvaFinanceiraPeriodo> = { [property]: newValue };
    for (const colDefFormula of this.helper.colDefs.filter(cd => cd.formula)) {
      atualizacaoItem[colDefFormula.id!] = this.sheet.getCell(row, colDefFormula.col!).value();
    }
    const periodo: CurvaFinanceiraPeriodo = { ...oldItem, ...atualizacaoItem };

    this._updatePeriodo(periodo._id, atualizacaoItem);

    if (property === 'execucaoPrevistaTemporario') {
      this._updateFila({
        idObraCurvaFinanceiraPeriodo: periodo.idObraCurvaFinanceiraPeriodo,
        execucaoPrevistaTemporario: periodo.execucaoPrevistaTemporario,
      });
      this._redrawBtnPublicar();
      this._redrawBtnCongelar();
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

  activated(): void {
    if (this._isActivated) {
      return;
    }
    this._isActivated = true;
    this.cliCurvaFinanceiraService
      .getMedicao(this.idProjeto, this.curvaFinanceira.id)
      .pipe(
        tap(dataCurvaFinanceira => {
          this.dataCurvaFinanceira = dataCurvaFinanceira;
          this.helper = new SpreadjsHelper(this.sheet, {
            colDefs: this.colDefs,
            idProperty: 'idObraCurvaFinanceiraPeriodo',
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
        })
      )
      .subscribe();
  }
}
