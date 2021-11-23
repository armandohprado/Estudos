import {
  CellClickedEvent,
  CellDoubleClickedEvent,
  CellKeyDownEvent,
  CellValueChangedEvent,
  ColDef,
  ColGroupDef,
  Column,
  ColumnApi,
  ICellEditorParams,
  ICellRendererParams,
  IDoesFilterPassParams,
  IFilterParams,
  RowNode,
  ValueFormatterParams,
  ValueSetterParams,
  GridOptions,
} from '@ag-grid-community/all-modules';
import { KeyofPlanoCompras, PlanoCompras } from '../models/plano-compras';
import { PcGridColumnGroupEnum } from '../pc-grid/pc-grid.service';
import { PcGridCellRendererParams } from '../pc-grid/pc-grid-custom/pc-grid-cell/pc-grid-cell.component';

export interface ColumnCustom extends Column {
  getColDef(): ColDefCustom;
  getColId(): KeyofPlanoCompras;
}

export interface ColumnApiCustom extends ColumnApi {
  getAllColumns(): ColumnCustom[];
}

export interface ColGroupDefCustom extends ColGroupDef {
  children: (ColDefCustom | ColGroupDefCustom)[];
}

export interface ColDefCustom extends ColDef {
  field?: KeyofPlanoCompras;
  children?: (ColDefCustom | ColGroupDefCustom)[];
  valueSetter?: ((params: ValueSetterParamsCustom) => boolean) | string;
  awGroup?: PcGridColumnGroupEnum;
  // editable?: boolean | IsColumnFuncCustom;
  valueFormatter?(params: ValueFormatterParamsCustom): string;
  comparator?(valueA: any, valueB: any, nodeA: RowNodeCustom, nodeB: RowNodeCustom, isInverted: boolean): number;
  onCellValueChanged?(params: CellValueChangedEventCustom): void;
  onDelete?(params: PcGridCellRendererParams): void;
}

export interface CellKeyDownEventCustom extends CellKeyDownEvent {
  colDef: ColDefCustom;
  column: ColumnCustom;
  columnApi: ColumnApiCustom;
  data: PlanoCompras;
  event: KeyboardEvent;
}

export interface ICellRendererParamsCustom<T = any> extends ICellRendererParams {
  data: PlanoCompras;
  colDef: ColDefCustom;
  value: T;
  node: RowNodeCustom;
  formatValue(value: T): any;
  getValue(): T;
  setValue(value: T): void;
}

export interface ICellEditorParamsCustom<T = any> extends ICellEditorParams {
  data: PlanoCompras;
  value: T;
  colDef: ColDefCustom;
  node: RowNodeCustom;
  formatValue: (value: T) => any;
  parseValue: (value: T) => any;
}

export interface ValueFormatterParamsCustom<T = any> extends ValueFormatterParams {
  colDef: ColDefCustom;
  data: PlanoCompras;
  value: T;
  node: RowNodeCustom;
}

export interface ValueSetterParamsCustom<T = any> extends ValueSetterParams {
  data: PlanoCompras;
  colDef: ColDefCustom;
  oldValue: T;
  newValue: T;
  node: RowNodeCustom;
}

export interface IDoesFilterPassParamsCustom extends IDoesFilterPassParams {
  data: PlanoCompras;
  node: RowNodeCustom;
}

export interface RowNodeCustom extends RowNode {
  data: PlanoCompras;
  parent: RowNodeCustom | null;
  detailNode: RowNodeCustom;
  childFlower: RowNodeCustom;
  childrenAfterGroup: RowNodeCustom[];
  childrenAfterFilter: RowNodeCustom[];
  childrenAfterSort: RowNodeCustom[];
  isParentOfNode(potentialParent: RowNodeCustom): boolean;
  depthFirstSearch(callback: (rowNode: RowNodeCustom) => void): void;
  setDataValue(colKey: KeyofPlanoCompras | Column, newValue: any): void;
  setData(data: PlanoCompras): void;
  setDataAndId(data: PlanoCompras, id: string | undefined): void;
}

export interface CellValueChangedEventCustom<T = any> extends CellValueChangedEvent {
  data: PlanoCompras;
  value: T;
  newValue: T;
  oldValue: T;
  node: RowNodeCustom;
  colDef: ColDefCustom;
}

export interface CellDoubleClickedEventCustom<T = any, C = any> extends CellDoubleClickedEvent {
  colDef: ColDefCustom;
  data: PlanoCompras;
  value: T;
  node: RowNodeCustom;
  context: C;
}

export interface CellClickedEventCustom<T = any> extends CellClickedEvent {
  colDef: ColDefCustom;
  data: PlanoCompras;
  value: T;
  node: RowNodeCustom;
}

export interface IFilterParamsCustom extends IFilterParams {
  colDef: ColDefCustom;
  valueGetter: (rowNode: RowNodeCustom) => any;
  doesRowPassOtherFilter: (rowNode: RowNodeCustom) => boolean;
}

export interface GridOptionsCustom extends GridOptions {
  defaultColDef: ColDefCustom;
  columnTypes?: {
    [key: string]: ColDefCustom;
  };
}
