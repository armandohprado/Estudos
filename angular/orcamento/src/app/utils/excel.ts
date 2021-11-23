import { Spread } from '@grapecity/spread-sheets';

export function numberFormat(decimal = 2): string {
  return `#,##0.${'0'.repeat(decimal)}`;
}

export const CULTURE_EXCEL = new Spread.Common.CultureInfo();
CULTURE_EXCEL.NumberFormat.currencySymbol = 'R$';
CULTURE_EXCEL.NumberFormat.numberDecimalSeparator = ',';
CULTURE_EXCEL.NumberFormat.numberGroupSeparator = '.';
CULTURE_EXCEL.NumberFormat.listSeparator = ';';
CULTURE_EXCEL.NumberFormat.arrayListSeparator = ',';

export const FONT_EXCEL = {
  normal: { [16]: 'normal 16px Calibri' },
  bold: { [10]: 'bold 10px Calibri', [12]: 'bold 12px Calibri', [16]: 'bold 16px Calibri', [20]: 'bold 20px Calibri' },
};

export interface ColDefArgs<T extends Record<any, any>> {
  row: number;
  col: number;
  item: T;
  colDef: ColDef<T>;
}

export type ColDefLockedFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefLockedFn<T extends Record<any, any>> = (args: ColDefLockedFnArgs<T>) => boolean;

export interface ColDefBorder {
  border: Spread.Sheets.LineBorder;
  options: Spread.Sheets.ISetBorderOptions;
}
export type ColDefBorderFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefBorderFn<T extends Record<any, any>> = (args: ColDefBorderFnArgs<T>) => ColDefBorder;

export type ColDefFormulaFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefFormulaFn<T extends Record<any, any>> = (args: ColDefFormulaFnArgs<T>) => string;

export type ColDefBackColorFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefBackColor =
  | undefined
  | string
  | Spread.Sheets.IPatternFill
  | Spread.Sheets.IGradientFill
  | Spread.Sheets.IGradientPathFill;
export type ColDefBackColorFn<T extends Record<any, any>> = (args: ColDefBackColorFnArgs<T>) => ColDefBackColor;

export type ColDefWidthValue = string | number | null | undefined;
export interface ColDefWidthObject {
  value: string | number;
  sheetArea?: Spread.Sheets.SheetArea;
}
export type ColDefWidthTupple = [value: string | number, sheetArea?: Spread.Sheets.SheetArea];
export type ColDefWidth = ColDefWidthValue | ColDefWidthObject | ColDefWidthTupple;

export interface ColDefComment {
  foreColor?: string;
  fontSize?: string;
  horizontalAlign?: Spread.Sheets.HorizontalAlign;
  dynamicMove?: boolean;
  autoSize?: boolean;
  padding?: Spread.Sheets.Comments.Padding;
  displayMode?: Spread.Sheets.Comments.DisplayMode;
  text: string;
}

export type ColDefCommentFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefCommentFn<T extends Record<any, any>> = (args: ColDefCommentFnArgs<T>) => ColDefComment;

export type ColDefHAlign = Spread.Sheets.HorizontalAlign | undefined;
export type ColDefHAlignFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefHAlignFn<T extends Record<any, any>> = (args: ColDefHAlignFnArgs<T>) => ColDefHAlign;

export type ColDefFont = string | undefined;
export type ColDefFontFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefFontFn<T extends Record<any, any>> = (args: ColDefFontFnArgs<T>) => ColDefFont;

export interface ColDefVisibleFnArgs<T extends Record<any, any>> {
  col: number;
  colDef: ColDef<T>;
}
export type ColDefVisibleFn<T extends Record<any, any>> = (args: ColDefVisibleFnArgs<T>) => boolean;

export interface ColDefValidatorFnArgs<T extends Record<any, any>> extends ColDefArgs<T> {
  value: any;
}
export type ColDefValidatorFn<T extends Record<any, any>> = (args: ColDefValidatorFnArgs<T>) => any;

export interface ColDef<T extends Record<any, any>> {
  id?: keyof T;
  nome?: string;
  col: number;
  formatter?: Spread.Formatter.GeneralFormatter | string;
  cellType?: Spread.Sheets.CellTypes.Base;
  locked?: boolean | ColDefLockedFn<T>;
  colSpan?: number;
  border?: ColDefBorder | ColDefBorderFn<T>;
  formula?: ColDefFormulaFn<T>;
  backColor?: ColDefBackColor | ColDefBackColorFn<T>;
  width?: ColDefWidth;
  widthSheetArea?: Spread.Sheets.SheetArea;
  comment?: ColDefComment | ColDefCommentFn<T>;
  hAlign?: ColDefHAlign | ColDefHAlignFn<T>;
  font?: ColDefFont | ColDefFontFn<T>;
  visible?: boolean | ColDefVisibleFn<T>;
  group?: string;
  validator?: ColDefValidatorFn<T>;
  defaultValue?: T[keyof T] | null | undefined;
}
