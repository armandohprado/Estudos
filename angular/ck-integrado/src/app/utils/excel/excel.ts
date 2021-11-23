import { Spread } from '@grapecity/spread-sheets';

export type ExcelFontType = 'normal' | 'bold';

export interface ColDefColsArgs<T extends Record<any, any>> {
  col: number;
  colDef: ColDef<T>;
}

export interface ColDefArgs<T extends Record<any, any>> extends ColDefColsArgs<T> {
  row: number;
  item: T;
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
export type ColDefFormulaFn<T extends Record<any, any>> = (args: ColDefFormulaFnArgs<T>) => string | undefined;

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

export type ColDefVAlign = Spread.Sheets.VerticalAlign | undefined;
export type ColDefVAlignFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefVAlignFn<T extends Record<any, any>> = (args: ColDefVAlignFnArgs<T>) => ColDefVAlign;

export type ColDefFont = string | undefined;
export type ColDefFontFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefFontFn<T extends Record<any, any>> = (args: ColDefFontFnArgs<T>) => ColDefFont;

export type ColDefVisibleFnArgs<T extends Record<any, any>> = ColDefColsArgs<T>;
export type ColDefVisibleFn<T extends Record<any, any>> = (args: ColDefVisibleFnArgs<T>) => boolean;

export type ColDefTitleBorderFnArgs<T extends Record<any, any>> = ColDefColsArgs<T>;
export type ColDefTitleBorderFn<T extends Record<any, any>> = (args: ColDefTitleBorderFnArgs<T>) => ColDefBorder;

export type ColDefBorderPositionFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefBorderPositionFn<T extends Record<any, any>> = (
  args: ColDefBorderPositionFnArgs<T>
) => Spread.Sheets.LineBorder;

export type ColDefTitleBorderPositionFnArgs<T extends Record<any, any>> = ColDefColsArgs<T>;
export type ColDefTitleBorderPositionFn<T extends Record<any, any>> = (
  args: ColDefTitleBorderPositionFnArgs<T>
) => Spread.Sheets.LineBorder;

export type ColDefDataValidatorFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefDataValidatorFn<T extends Record<any, any>> = (
  args: ColDefDataValidatorFnArgs<T>
) => Spread.Sheets.DataValidation.DefaultDataValidator | undefined;

export type ColDefForeColor = string | undefined;
export type ColDefForeColorFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefForeColorFn<T extends Record<any, any>> = (args: ColDefForeColorFnArgs<T>) => ColDefForeColor;

export interface ColDefConditionalColors {
  backColor?: string;
  foreColor?: string;
}

export type ColDefHyperLink<T extends Record<any, any>> =
  | Spread.Sheets.IHyperlink
  | [keyof T, Omit<Spread.Sheets.IHyperlink, 'url'>]
  | undefined;
export type ColDefHyperLinkFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefHyperLinkFn<T extends Record<any, any>> = (
  args: ColDefHyperLinkFnArgs<T>
) => Spread.Sheets.IHyperlink;

export interface ColDefTimepickerGranularity {
  hour?: number;
  minute?: number;
  second?: number;
}

export interface ColDefTimepickerOptions {
  min?: ColDefTimepickerGranularity;
  max?: ColDefTimepickerGranularity;
  step?: ColDefTimepickerGranularity;
  formatString?: string;
  height?: number;
}

export type ColDefTimepicker = ColDefTimepickerOptions | undefined;
export type ColDefTimepickerFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefTimepickerFn<T extends Record<any, any>> = (args: ColDefTimepickerFnArgs<T>) => ColDefTimepicker;

export type ColDefFormatter = Spread.Formatter.GeneralFormatter | string | undefined;
export type ColDefFormatterFnArgs<T extends Record<any, any>> = ColDefArgs<T>;
export type ColDefFormatterFn<T extends Record<any, any>> = (args: ColDefFormatterFnArgs<T>) => ColDefFormatter;

export type ColDefDefaultValue<T extends Record<any, any>, K extends keyof T = keyof T> = T[K] | null | undefined;

export interface ColDef<T extends Record<any, any>> {
  id?: keyof T;
  title?: string;
  col?: number;
  formatter?: ColDefFormatter | ColDefFormatterFn<T>;
  cellType?: Spread.Sheets.CellTypes.Base;
  locked?: boolean | ColDefLockedFn<T>;
  colSpan?: number;
  border?: ColDefBorder | ColDefBorderFn<T>;
  borderTop?: Spread.Sheets.LineBorder | ColDefBorderPositionFn<T>;
  borderRight?: Spread.Sheets.LineBorder | ColDefBorderPositionFn<T>;
  borderBottom?: Spread.Sheets.LineBorder | ColDefBorderPositionFn<T>;
  borderLeft?: Spread.Sheets.LineBorder | ColDefBorderPositionFn<T>;
  formula?: ColDefFormulaFn<T>;
  backColor?: ColDefBackColor | ColDefBackColorFn<T>;
  width?: ColDefWidth;
  widthSheetArea?: Spread.Sheets.SheetArea;
  comment?: ColDefComment | ColDefCommentFn<T>;
  hAlign?: ColDefHAlign | ColDefHAlignFn<T>;
  vAlign?: ColDefVAlign | ColDefVAlignFn<T>;
  font?: ColDefFont | ColDefFontFn<T>;
  titleFont?: ColDefFont;
  visible?: boolean | ColDefVisibleFn<T>;
  group?: string;
  titleBorder?: ColDefBorder | ColDefTitleBorderFn<T>;
  titleBorderTop?: Spread.Sheets.LineBorder | ColDefTitleBorderPositionFn<T>;
  titleBorderRight?: Spread.Sheets.LineBorder | ColDefTitleBorderPositionFn<T>;
  titleBorderBottom?: Spread.Sheets.LineBorder | ColDefTitleBorderPositionFn<T>;
  titleBorderLeft?: Spread.Sheets.LineBorder | ColDefTitleBorderPositionFn<T>;
  titleBackColor?: ColDefBackColor;
  titleVAlign?: ColDefVAlign;
  titleHAlign?: ColDefHAlign;
  validator?: Spread.Sheets.DataValidation.DefaultDataValidator | ColDefDataValidatorFn<T> | undefined;
  datePicker?: boolean;
  foreColor?: ColDefForeColor | ColDefForeColorFn<T>;
  conditionalColor?: Record<any, ColDefConditionalColors>;
  buttons?: Spread.Sheets.ICellButton[];
  hyperLink?: ColDefHyperLink<T> | ColDefHyperLinkFn<T>;
  textIndent?: number;
  autoFitColumn?: boolean;
  cellPadding?: number | string;
  timepicker?: ColDefTimepicker | ColDefTimepickerFn<T>;
  defaultValue?: ColDefDefaultValue<T>;
  customCellType?: boolean;
}
