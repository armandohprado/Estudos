import { WorksheetComponent } from '@grapecity/spread-sheets-angular';
import { Spread } from '@grapecity/spread-sheets';
import { Directive, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

export interface CellChangedEvent {
  row: number;
  col: number;
}

@Directive()
export abstract class WorksheetAbstract implements OnDestroy {
  protected constructor(protected worksheetComponent: WorksheetComponent) {
    this.sheet = worksheetComponent.getSheet();
  }

  private _cellChanges$ = new Subject<CellChangedEvent>();
  protected _destroy$ = new Subject();

  initialized = false;
  workbook?: Spread.Sheets.Workbook;
  sheet: Spread.Sheets.Worksheet;

  get colCount(): number {
    return this.sheet.getColumnCount();
  }

  init(workbook: Spread.Sheets.Workbook): void {
    this.workbook = workbook;
    if (!this.workbook) {
      throw new Error('@Input() workbook é obrigatório');
    }
    this.workbook.bind(Spread.Sheets.Events.EditEnded, (event: any, args: Spread.Sheets.IEditEndedEventArgs) => {
      if (args.sheetName === this.sheet.name()) {
        this.editEnded?.(args);
        this._cellChanges$.next({ row: args.row, col: args.col });
      }
    });
    this.workbook.bind(Spread.Sheets.Events.CellChanged, (event: any, args: Spread.Sheets.ICellChangedEventArgs) => {
      if (args.sheetName === this.sheet.name()) {
        this.cellChanged?.(args);
        this._cellChanges$.next({ row: args.row, col: args.col });
      }
    });
    this.workbook.bind(
      Spread.Sheets.Events.ClipboardPasted,
      (event: any, args: Spread.Sheets.IClipboardPastedEventArgs) => {
        if (args.sheetName === this.sheet.name()) {
          this.clipboardPasted?.(args);
          for (let i = 0; i < args.cellRange.colCount; i++) {
            const colI = args.cellRange.col + i;
            for (let j = 0; j < args.cellRange.rowCount; j++) {
              const rowI = args.cellRange.row + j;
              this._cellChanges$.next({ row: rowI, col: colI });
            }
          }
        }
      }
    );
    this.workbook.bind(Spread.Sheets.Events.CellClick, (event: any, args: Spread.Sheets.ICellClickEventArgs) => {
      if (args.sheetName === this.sheet.name()) {
        this.cellClicked?.(args);
      }
    });
    this.workbook.bind(Spread.Sheets.Events.RangeChanged, (event: any, args: Spread.Sheets.IRangeChangedEventArgs) => {
      if (args.sheetName === this.sheet.name()) {
        this.rangeChanged?.(args);
        if (args.action === Spread.Sheets.RangeChangedAction.clear) {
          for (const cell of args.changedCells) {
            this.deleteChanged?.(cell.row, cell.col);
            this._cellChanges$.next({ row: cell.row, col: cell.col });
          }
        }
      }
    });
    this.initialized = true;
  }

  editEnded?($event: Spread.Sheets.IEditEndedEventArgs): void;
  clipboardPasted?($event: Spread.Sheets.IClipboardPastedEventArgs): void;
  cellChanged?($event: Spread.Sheets.ICellChangedEventArgs): void;
  cellClicked?($event: Spread.Sheets.ICellClickEventArgs): void;
  rangeChanged?($event: Spread.Sheets.IRangeChangedEventArgs): void;
  deleteChanged?(row: number, col: number): void;
  activated?(): void;

  listenToChanges<T = any>(row: number, col: number): Observable<T> {
    return this._cellChanges$.pipe(
      filter(event => event.row === row && event.col === col),
      map(event => this.sheet.getCell(event.row, event.col).value()),
      distinctUntilChanged()
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
