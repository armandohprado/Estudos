import { Directive, EventEmitter, Host, Input, OnDestroy, Output, Self } from '@angular/core';
import { WorksheetAbstract } from '@aw-utils/excel/worksheet-abstract';
import { WorksheetComponent } from '@grapecity/spread-sheets-angular';
import { Spread } from '@grapecity/spread-sheets';
import { Cronograma, CronogramaItem, CronogramaItemAtualizarPayload, Cronogramas } from '@aw-models/cronogramas';
import { SpreadjsHelper } from '@aw-utils/excel/spreadjs-helper';
import { CheckListIntegradoComponent } from '../check-list-integrado.component';
import { CliFuncao } from '@aw-models/funcao';
import { ColDef } from '@aw-utils/excel/excel';
import { debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { BehaviorSubject, concat, Observable } from 'rxjs';
import { CheckListIntegradoService } from '../check-list-integrado.service';
import { isFunction, upsert } from '@aw-utils/utils';

export type CronogramaItemColDef = ColDef<CronogramaItem>;

@Directive({
  selector: 'gc-worksheet[appCliCronogramas]',
  providers: [{ provide: WorksheetAbstract, useExisting: CliCronogramasDirective }],
})
export class CliCronogramasDirective extends WorksheetAbstract implements OnDestroy {
  constructor(
    @Self() worksheetComponent: WorksheetComponent,
    @Host() private checkListIntegradoComponent: CheckListIntegradoComponent,
    private checkListIntegradoService: CheckListIntegradoService
  ) {
    super(worksheetComponent);
  }

  private _filaCronogramas$ = new BehaviorSubject<CronogramaItemAtualizarPayload[]>([]);

  @Input() funcao!: CliFuncao;
  @Input() cronogramas!: Cronogramas;
  @Input() rowStart!: number;
  @Output() readonly cronogramasChange = new EventEmitter<Cronogramas>();

  get cronogramasItens(): CronogramaItem[] {
    return this.cronogramas.cronogramas.reduce(
      (acc, cronograma) => [...acc, ...cronograma.itens],
      [] as CronogramaItem[]
    );
  }

  helper!: SpreadjsHelper<CronogramaItem>;

  colDefs: CronogramaItemColDef[] = [
    {
      id: '_id',
      title: 'Id',
      visible: false,
    },
    {
      id: 'descricao',
      title: 'DESCRIÇÃO',
      width: 400,
      titleHAlign: Spread.Sheets.HorizontalAlign.general,
    },
    {
      id: 'dataPrevista',
      title: 'DATA PREVISTA',
      formatter: this.checkListIntegradoComponent.formatter.date,
      datePicker: true,
      locked: ({ item }) => item.bloquearDataPrevista || this.cronogramas.publicado || this.funcao !== 'Gerencial',
      backColor: ({ item }) =>
        item.bloquearDataPrevista || this.cronogramas.publicado || this.funcao !== 'Gerencial'
          ? this.checkListIntegradoComponent.color.notEditable
          : this.checkListIntegradoComponent.color.white,
      hAlign: Spread.Sheets.HorizontalAlign.center,
    },
    {
      id: 'dataRealizada',
      title: 'DATA REALIZADA',
      formatter: this.checkListIntegradoComponent.formatter.date,
      hAlign: Spread.Sheets.HorizontalAlign.center,
      datePicker: true,
      locked: () => this.funcao !== 'Gerencial',
      backColor: () =>
        this.funcao !== 'Gerencial'
          ? this.checkListIntegradoComponent.color.notEditable
          : this.checkListIntegradoComponent.color.white,
    },
  ];

  private _updateCronograma(
    _idCronograma: number | ((cronograma: Cronograma) => boolean),
    partial: Partial<Cronograma> | ((cronograma: Cronograma) => Cronograma)
  ): void {
    const predicate = isFunction(_idCronograma)
      ? _idCronograma
      : (cronograma: Cronograma) => cronograma._id === _idCronograma;
    const update = isFunction(partial) ? partial : (cronograma: Cronograma) => ({ ...cronograma, ...partial });
    this.cronogramas = {
      ...this.cronogramas,
      cronogramas: this.cronogramas.cronogramas.map(cronograma => {
        if (predicate(cronograma)) {
          cronograma = update(cronograma);
        }
        return cronograma;
      }),
    };
    this.cronogramasChange.emit(this.cronogramas);
  }

  private _updateCronogramaItem(
    _idCronograma: number | ((cronograma: Cronograma) => boolean),
    _id: number | ((item: CronogramaItem) => boolean),
    partial: Partial<CronogramaItem> | ((item: CronogramaItem) => CronogramaItem)
  ): void {
    const predicate = isFunction(_id) ? _id : (item: CronogramaItem) => item._id === _id;
    const update = isFunction(partial) ? partial : (item: CronogramaItem) => ({ ...item, ...partial });
    this._updateCronograma(_idCronograma, cronograma => ({
      ...cronograma,
      itens: cronograma.itens.map(item => {
        if (predicate(item)) {
          item = update(item);
        }
        return item;
      }),
    }));
  }

  private _montarSheetCronogramas(): void {
    const cronogramas = this.cronogramas.cronogramas.reduce(
      (acc, cronograma) => acc + 1 + cronograma.itens.length,
      this.rowStart + 1
    );

    this.sheet.setRowCount(cronogramas);

    this.checkListIntegradoComponent.montarCabecalho(this.sheet, this.colCount, this.cronogramas.publicado);

    this.checkListIntegradoComponent.setColTitles(this.helper);

    let row = this.rowStart + 1;

    for (const cronograma of this.cronogramas.cronogramas) {
      this.checkListIntegradoComponent.montarLinhaTitle(this.sheet, row, this.colCount - 1, cronograma.descricao);
      row++;
      for (const item of cronograma.itens) {
        this.helper.setRow(row, item);
        row++;
      }
    }

    this._watchFilaCronogramas();
  }

  private _watchFilaCronogramas(): void {
    this._filaCronogramas$
      .pipe(
        debounceTime(1000),
        takeUntil(this._destroy$),
        filter(payloads => !!payloads.length),
        switchMap(payloads => {
          this._filaCronogramas$.next([]);
          return this._atualizarCronogramasItens(payloads);
        }),
        catchAndThrow(() => {
          alert('Ocorreu um erro ao tentar salvar as últimas alterações');
          this._watchFilaCronogramas();
        })
      )
      .subscribe();
  }

  private _atualizarCronogramasItens(payloads: CronogramaItemAtualizarPayload[]): Observable<void> {
    return concat(...payloads.map(payload => this.checkListIntegradoService.putCronogramaItem(payload)));
  }

  private _updateFilaCronograma(payload: CronogramaItemAtualizarPayload): void {
    this._filaCronogramas$.next(upsert(this._filaCronogramas$.value, payload, 'idProjetoCheckListCronogramaItem'));
  }

  private _changedCronogramas(row: number, col: number, _newValue?: any): void {
    const tupple = this.checkListIntegradoComponent.checkChanged(
      row,
      col,
      this.helper.colDefsMap,
      this.sheet,
      this.cronogramasItens,
      _newValue
    );
    if (!tupple) {
      return;
    }
    let [item, property, newValue] = tupple;
    const atualizacaoItem: Partial<CronogramaItem> = { [property]: newValue };
    for (const colDefFormula of this.helper.colDefs.filter(cd => cd.formula)) {
      atualizacaoItem[colDefFormula.id!] = this.sheet.getCell(row, colDefFormula.col!).value();
    }
    item = { ...item, ...atualizacaoItem };
    this._updateCronogramaItem(item._idCronograma, item._id, atualizacaoItem);
    this._updateFilaCronograma({
      idProjetoCheckListCronogramaItem: item.idProjetoCheckListCronogramaItem,
      dataPrevista: item.dataPrevista,
      dataRealizada: item.dataRealizada,
    });
  }

  clipboardPasted({ cellRange: { col, colCount, rowCount, row } }: Spread.Sheets.IClipboardPastedEventArgs): void {
    for (let i = 0; i < colCount; i++) {
      const colI = col + i;
      for (let j = 0; j < rowCount; j++) {
        const rowI = row + j;
        this._changedCronogramas(rowI, colI);
      }
    }
  }

  editEnded({ row, col }: Spread.Sheets.IEditEndedEventArgs): void {
    this.helper.checkDefaulValue(row, col);
    this._changedCronogramas(row, col);
  }

  cellChanged({ row, col }: Spread.Sheets.ICellChangedEventArgs): void {
    const colDef = this.helper.colDefsMap.get(col);
    if (colDef?.datePicker) {
      this._changedCronogramas(row, col);
    }
  }

  deleteChanged(row: number, col: number): void {
    this._changedCronogramas(row, col);
  }

  init(workbook: Spread.Sheets.Workbook): void {
    this.helper = new SpreadjsHelper<CronogramaItem>(this.sheet, {
      colDefs: this.colDefs,
      colDefDefault: this.checkListIntegradoComponent.defaultColDef,
      autoFitRows: true,
      idProperty: 'idProjetoCheckListCronogramaItem',
    });
    this.helper.executeSuspended(
      () => {
        this._montarSheetCronogramas();
      },
      { event: true, paint: true }
    );
    super.init(workbook);
  }

  ngOnDestroy(): void {
    this.helper.destroy();
    super.ngOnDestroy();
  }
}
