import {
  ColDef,
  ColDefArgs,
  ColDefColsArgs,
  ColDefTimepicker,
  ColDefTimepickerOptions,
  ExcelFontType,
} from '@aw-utils/excel/excel';
import { Spread } from '@grapecity/spread-sheets';
import { isArray, isFunction, isNil, isObject } from '@aw-utils/utils';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

export const CULTURE_EXCEL = new Spread.Common.CultureInfo();
CULTURE_EXCEL.NumberFormat.currencySymbol = 'R$';
CULTURE_EXCEL.NumberFormat.numberDecimalSeparator = ',';
CULTURE_EXCEL.NumberFormat.numberGroupSeparator = '.';
CULTURE_EXCEL.NumberFormat.listSeparator = ';';
CULTURE_EXCEL.NumberFormat.arrayListSeparator = ',';
Spread.Common.CultureManager.addCultureInfo('pt-BR', CULTURE_EXCEL);
Spread.Common.CultureManager.culture('pt-BR');

export interface ColDefWithLetter<T extends Record<any, any>> extends Omit<ColDef<T>, 'col'> {
  letter: string;
  col: number;
}

export interface SpreadjsHelperConfig<T extends Record<any, any>, K extends keyof T = keyof T> {
  colDefs: ColDef<T>[];
  colDefDefault?: Partial<ColDef<T>>;
  idProperty: K;
  autoFitRows?: boolean;
  autoFitRowsOnWindowResize?: boolean;
}

export interface SpreadjsHelperSuspendOptions {
  paint?: boolean;
  event?: boolean;
  dirty?: boolean;
}

export const excelBuilderConfigDefault: Partial<SpreadjsHelperConfig<any>> = {
  autoFitRows: true,
  autoFitRowsOnWindowResize: false,
};

export class SpreadjsHelper<T extends Record<any, any>, K extends keyof T = keyof T> {
  constructor(
    public sheet: Spread.Sheets.Worksheet,
    { colDefDefault, colDefs, idProperty, ...config }: SpreadjsHelperConfig<T, K>
  ) {
    this.colDefDefault = colDefDefault;
    const [generatedColDef, generatedColDefMap] = this._generateColDefs(colDefs);
    this.colDefs = generatedColDef;
    this.colDefsMap = generatedColDefMap;
    this.idProperty = idProperty;
    this.config = { ...excelBuilderConfigDefault, ...config };
    this._watchWindowResize();
  }

  private _destroy$ = new Subject();

  idProperty: K;
  colDefsMap: Map<number | keyof T, ColDefWithLetter<T>>;
  colDefs: ColDefWithLetter<T>[];
  colDefDefault?: Partial<ColDefWithLetter<T>>;
  idRowMap = new Map<T[K], number>();
  config: Omit<SpreadjsHelperConfig<T>, 'colDefs' | 'colDefDefault' | 'idProperty'>;

  private _generateColDefs(_colDefs: ColDef<T>[]): [ColDefWithLetter<T>[], Map<number | keyof T, ColDefWithLetter<T>>] {
    const colDefs = _colDefs.map((colDef, col) => ({
      ...this.colDefDefault,
      ...colDef,
      letter: this.getLetter(col),
      col: colDef.col ?? col,
    }));
    const tuppleCol: [number, ColDefWithLetter<T>][] = colDefs.map(colDef => [colDef.col, colDef]);
    const tuppleId: [keyof T, ColDefWithLetter<T>][] = colDefs
      .filter(colDef => colDef.id)
      .map(colDef => [colDef.id!, colDef]);
    return [colDefs, new Map<number | keyof T, ColDefWithLetter<T>>([...tuppleCol, ...tuppleId])];
  }

  private _watchWindowResize(): void {
    if (this.config.autoFitRowsOnWindowResize) {
      fromEvent(window, 'resize', { passive: true })
        .pipe(takeUntil(this._destroy$), debounceTime(100))
        .subscribe(() => {
          this.autoFitRows([...this.idRowMap.values()]);
        });
    }
  }

  private _suspend({ dirty, event, paint }: SpreadjsHelperSuspendOptions): void {
    if (paint) {
      this.sheet.suspendPaint();
    }
    if (event) {
      this.sheet.suspendEvent();
    }
    if (dirty) {
      this.sheet.suspendDirty();
    }
  }

  private _resume({ dirty, event, paint }: SpreadjsHelperSuspendOptions): void {
    if (paint) {
      this.sheet.resumePaint();
    }
    if (event) {
      this.sheet.resumeEvent();
    }
    if (dirty) {
      this.sheet.resumeDirty();
    }
  }

  getLetter(col: number): string {
    return this.sheet.getValue(0, col, Spread.Sheets.SheetArea.colHeader);
  }

  resolveLockCell(row: number, colDef: ColDefWithLetter<T>, item: T): boolean {
    const { col, locked } = colDef;
    let isLocked: boolean | undefined;
    if (!isNil(locked)) {
      if (isFunction(locked)) {
        isLocked = locked({ row, col, item, colDef });
      } else {
        isLocked = locked;
      }
    }
    return isLocked ?? true;
  }

  setBorder(cell: Spread.Sheets.CellRange, colDef: ColDefWithLetter<T>, item?: T): this {
    const {
      titleBorder,
      col,
      titleBorderLeft,
      titleBorderTop,
      titleBorderBottom,
      titleBorderRight,
      borderRight,
      borderBottom,
      borderTop,
      borderLeft,
      border,
      colSpan,
    } = colDef;
    const colArgs: ColDefColsArgs<T> = { col, colDef };
    const resolveTitleBorder = <B>(_border: B | ((args: ColDefColsArgs<T>) => B)): B =>
      isFunction(_border) ? _border(colArgs) : _border;
    if (titleBorder) {
      const titleBorderOptions = resolveTitleBorder(titleBorder);
      cell.setBorder(titleBorderOptions.border, titleBorderOptions.options);
    }
    if (titleBorderLeft) {
      const lineBorder = resolveTitleBorder(titleBorderLeft);
      cell.borderLeft(lineBorder);
    }
    if (titleBorderTop) {
      const lineBorder = resolveTitleBorder(titleBorderTop);
      cell.borderTop(lineBorder);
    }
    if (titleBorderBottom) {
      const lineBorder = resolveTitleBorder(titleBorderBottom);
      cell.borderBottom(lineBorder);
    }
    if (titleBorderRight) {
      const lineBorder = resolveTitleBorder(titleBorderRight);
      cell.borderRight(lineBorder);
    }
    if (item) {
      const row = cell.row;
      const fnArgs: ColDefArgs<T> = { item, row, ...colArgs };
      const resolveBorder = <B>(_border: B | ((args: ColDefArgs<T>) => B)): B =>
        isFunction(_border) ? _border(fnArgs) : _border;
      if (border) {
        const borderObj = isFunction(border) ? border(fnArgs) : border;
        if (colSpan) {
          this.sheet.getRange(row, col, 1, colSpan).setBorder(borderObj.border, borderObj.options);
        } else {
          cell.setBorder(borderObj.border, borderObj.options);
        }
      }
      if (borderLeft) {
        const lineBorder = resolveBorder(borderLeft);
        cell.borderLeft(lineBorder);
      }
      if (borderTop) {
        const lineBorder = resolveBorder(borderTop);
        cell.borderTop(lineBorder);
      }
      if (borderBottom) {
        const lineBorder = resolveBorder(borderBottom);
        cell.borderBottom(lineBorder);
      }
      if (borderRight) {
        const lineBorder = resolveBorder(borderRight);
        cell.borderRight(lineBorder);
      }
    }
    return this;
  }

  setDatepicker(cell: Spread.Sheets.CellRange): this {
    cell
      .cellButtons([
        {
          imageType: Spread.Sheets.ButtonImageType.dropdown,
          command: 'openDateTimePicker',
          useButtonStyle: true,
        },
      ])
      .dropDowns([
        {
          type: Spread.Sheets.DropDownType.dateTimePicker,
          option: {
            showTime: false,
          },
        },
      ]);
    return this;
  }

  setTimepicker(cell: Spread.Sheets.CellRange, options: ColDefTimepickerOptions): this {
    cell
      .cellButtons([
        {
          imageType: Spread.Sheets.ButtonImageType.dropdown,
          command: 'openTimePicker',
          useButtonStyle: true,
        },
      ])
      .dropDowns([
        {
          type: Spread.Sheets.DropDownType.timePicker,
          option: options,
        },
      ]);
    return this;
  }

  setVisible(colDef: ColDefWithLetter<T>): this {
    const { col, visible } = colDef;
    if (!isNil(visible)) {
      const visibleValue = isFunction(visible) ? visible({ col, colDef }) : visible;
      this.sheet.getRange(-1, col, -1, 1).visible(visibleValue);
    }
    return this;
  }

  setWidth({ col, width, widthSheetArea }: ColDefWithLetter<T>): this {
    if (width) {
      if (isArray(width)) {
        const [value, sheetArea] = width;
        this.sheet.setColumnWidth(col, value, sheetArea ?? widthSheetArea);
      } else if (isObject(width)) {
        const { value, sheetArea } = width;
        this.sheet.setColumnWidth(col, value, sheetArea ?? widthSheetArea);
      } else {
        this.sheet.setColumnWidth(col, width, widthSheetArea);
      }
    }
    return this;
  }

  setRow(row: number, item: T): this {
    for (const colDef of this.colDefs) {
      this.setCell(row, colDef, item);
    }
    if (this.config.autoFitRows) {
      this.sheet.autoFitRow(row);
    }
    this.idRowMap.set(item[this.idProperty], row);
    return this;
  }

  lockButtons(col: number, lock: boolean): void {
    const rowCount = this.sheet.getRowCount();
    for (let row = 0; row < rowCount; row++) {
      const cell = this.sheet.getCell(row, col);
      if (cell.cellButtons()?.length) {
        cell.locked(lock);
      }
    }
  }

  lockRow(row: number, lock: boolean): void {
    for (const colDef of this.colDefs) {
      this.sheet.getCell(row, colDef.col).locked(lock);
    }
  }

  resolveTimepicker(row: number, col: number, item: T): ColDefTimepicker | undefined {
    const colDef = this.colDefsMap.get(col);
    if (!colDef) {
      return;
    }
    const { timepicker } = colDef;
    const fnArgs: ColDefArgs<T> = { col: colDef.col, colDef, item, row };
    return isFunction(timepicker) ? timepicker(fnArgs) : timepicker;
  }

  setCell(row: number, colDef: ColDefWithLetter<T>, item: T): this {
    const {
      id,
      col,
      formatter,
      cellType,
      colSpan,
      formula,
      backColor,
      comment,
      hAlign,
      font,
      vAlign,
      validator,
      datePicker,
      foreColor,
      conditionalColor,
      buttons,
      hyperLink,
      textIndent,
      cellPadding,
      timepicker,
    } = colDef;
    const cell = this.sheet.getCell(row, col);
    if (id) {
      const fnArgs: ColDefArgs<T> = { col, colDef, item, row };
      const value = item[id];
      cell.value(value ?? '').wordWrap(true);
      const isLocked = this.resolveLockCell(row, colDef, item);
      if (!isLocked) {
        if (datePicker) {
          this.setDatepicker(cell);
        }
        if (timepicker) {
          const timepickerValue = isFunction(timepicker) ? timepicker(fnArgs) : timepicker;
          if (timepickerValue) {
            this.setTimepicker(cell, timepickerValue);
          }
        }
        if (buttons?.length) {
          cell.cellButtons(buttons);
        }
      }
      cell.locked(isLocked).cellType(cellType);
      if (colSpan) {
        this.sheet.addSpan(row, col, 1, colSpan, Spread.Sheets.SheetArea.viewport);
      }
      this.setBorder(cell, colDef, item);
      if (formula) {
        cell.formula(formula(fnArgs));
      }
      if (formatter) {
        const formatterValue = isFunction(formatter) ? formatter(fnArgs) : formatter;
        cell.formatter(formatterValue);
      }
      if (backColor) {
        const backColorValue = isFunction(backColor) ? backColor(fnArgs) : backColor;
        if (backColorValue) {
          cell.backColor(backColorValue);
        }
      }
      if (comment) {
        const commentOptions = isFunction(comment) ? comment(fnArgs) : comment;
        if (commentOptions) {
          const commentBox = new Spread.Sheets.Comments.Comment();
          for (const [option, optionArg] of Object.entries(commentOptions)) {
            (commentBox as any)?.[option]?.(optionArg);
          }
          cell.comment(commentBox);
        }
      }
      if (hAlign) {
        const hAlignValue = isFunction(hAlign) ? hAlign(fnArgs) : hAlign;
        if (hAlignValue) {
          cell.hAlign(hAlignValue);
        }
      }
      if (vAlign) {
        const vAlignValue = isFunction(vAlign) ? vAlign(fnArgs) : vAlign;
        if (vAlignValue) {
          cell.vAlign(vAlignValue);
        }
      }
      if (font) {
        const fontValue = isFunction(font) ? font(fnArgs) : font;
        if (fontValue) {
          cell.font(fontValue);
        }
      }
      if (validator) {
        const validatorValue = isFunction(validator) ? validator(fnArgs) : validator;
        if (validatorValue) {
          cell.validator(validatorValue);
        }
      }
      if (foreColor) {
        const foreColorValue = isFunction(foreColor) ? foreColor(fnArgs) : foreColor;
        if (foreColorValue) {
          cell.foreColor(foreColorValue);
        }
      }
      if (conditionalColor) {
        const range = new Spread.Sheets.Range(row, col, 1, 1);
        for (const [conditionalValue, colors] of Object.entries(conditionalColor)) {
          const style = new Spread.Sheets.Style();
          if (colors.backColor) {
            style.backColor = colors.backColor;
          }
          if (colors.foreColor) {
            style.foreColor = colors.foreColor;
          }
          this.sheet.conditionalFormats.addCellValueRule(
            Spread.Sheets.ConditionalFormatting.ComparisonOperators.equalsTo,
            conditionalValue,
            conditionalValue,
            style,
            [range]
          );
        }
      }
      if (hyperLink) {
        const hyperLinkValue = isFunction(hyperLink) ? hyperLink(fnArgs) : hyperLink;
        if (hyperLinkValue) {
          if (isArray(hyperLinkValue)) {
            const [property, link] = hyperLinkValue;
            const url = item[property];
            if (url) {
              this.sheet.setHyperlink(row, col, { ...link, url: item[property] });
            }
          } else {
            this.sheet.setHyperlink(row, col, hyperLinkValue);
          }
        }
      }
      if (!isNil(textIndent)) {
        cell.textIndent(textIndent);
      }
      if (!isNil(cellPadding)) {
        cell.cellPadding(cellPadding + '');
      }
    }
    return this;
  }

  getRowById(id: T[K]): number | undefined {
    return this.idRowMap.get(id);
  }

  autoFitRows(rows: number[]): void {
    this.executeSuspended(
      () => {
        for (const row of rows) {
          this.sheet.autoFitRow(row);
        }
      },
      { paint: true, event: true }
    );
  }

  autoFitColumns(cols: number[]): void {
    this.executeSuspended(
      () => {
        for (const col of cols) {
          this.sheet.autoFitColumn(col);
        }
      },
      { paint: true, event: true }
    );
  }

  executeSuspended(callback: (sheet: Spread.Sheets.Worksheet) => void, options: SpreadjsHelperSuspendOptions): void {
    this._suspend(options);
    callback(this.sheet);
    this._resume(options);
  }

  checkDefaulValue(row: number, col: number): void {
    const colDef = this.colDefsMap.get(col);
    if (!colDef || isNil(colDef.defaultValue)) {
      return;
    }
    const cell = this.sheet.getCell(row, col);
    if (isNil(cell.value())) {
      cell.value(colDef.defaultValue);
    }
  }

  destroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  static resolveFont(type: ExcelFontType, size: number, unit = 'pt'): string {
    return `${type} ${size}${unit} Calibri`;
  }

  static resolveNumberFormat(decimal = 2): string {
    return `#,##0.${'0'.repeat(decimal)}`;
  }
}
