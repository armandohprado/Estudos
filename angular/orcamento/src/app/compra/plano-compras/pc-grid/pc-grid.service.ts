import { Injectable } from '@angular/core';
import { ColumnState, GridApi } from '@ag-grid-community/all-modules';
import { ColumnApiCustom } from '../util/grid-custom-models';
import { KeyofPlanoCompras } from '../models/plano-compras';

export enum PcGridColumnGroupEnum {
  tudo,
  dnn,
  desenvolvimento,
  responsaveis,
  fornecedores,
  datas,
}
@Injectable({
  providedIn: 'root',
})
export class PcGridService {
  constructor() {}

  api: GridApi;
  columnApi: ColumnApiCustom;
  activeColumnGroup: PcGridColumnGroupEnum[] = [PcGridColumnGroupEnum.tudo];
  visibleCols: KeyofPlanoCompras[];

  filterModel: Record<string, any> = {};
  sortModel: ColumnState[] = [];
  realFilterModel: Record<string, any> = {};

  setInitialGrid(): void {
    if (this.visibleCols) {
      this.setVisibleCols(this.visibleCols);
    } else if (this.activeColumnGroup.length) {
      this.setGroupsVisible(this.activeColumnGroup);
    }
    this.api.setFilterModel(this.filterModel);
    this.columnApi.applyColumnState({ state: this.sortModel });
  }

  setGroupsVisible(groups: PcGridColumnGroupEnum[]): void {
    if (groups.includes(PcGridColumnGroupEnum.tudo)) {
      this.columnApi.setColumnsVisible(this.columnApi.getAllColumns(), true);
      this.activeColumnGroup = groups;
      return;
    }
    const visible = this.columnApi.getAllColumns().filter(col => {
      const colDef = col.getColDef();
      return groups.includes(colDef.awGroup) || !colDef.awGroup;
    });
    const hide = this.columnApi.getAllColumns().filter(col => {
      const colDef = col.getColDef();
      return !groups.includes(colDef.awGroup) && colDef.awGroup;
    });
    this.columnApi.setColumnsVisible(visible, true);
    this.columnApi.setColumnsVisible(hide, false);
    this.activeColumnGroup = groups;
    this.visibleCols = null;
  }

  setVisibleCols(cols: KeyofPlanoCompras[]): void {
    this.activeColumnGroup = [];
    const visible = this.columnApi.getAllColumns().filter(col => {
      return cols.includes(col.getColId()) || !col.getColDef().awGroup;
    });
    const hide = this.columnApi.getAllColumns().filter(col => {
      return !cols.includes(col.getColId()) && col.getColDef().awGroup;
    });
    this.columnApi.setColumnsVisible(visible, true);
    this.columnApi.setColumnsVisible(hide, false);
    this.visibleCols = cols;
    this.activeColumnGroup = this._getActiveGroup();
  }

  private _getActiveGroup(): PcGridColumnGroupEnum[] {
    const cols = this.columnApi.getAllColumns().filter(o => !!o.getColDef().awGroup);
    const visibleCols = cols.filter(col => col.isVisible());
    const isVisibleTotal = (group: PcGridColumnGroupEnum) => {
      const colsGroup = cols.filter(col => col.getColDef().awGroup === group);
      return colsGroup.length === colsGroup.filter(col => col.isVisible()).length;
    };
    const allVisible = visibleCols.length === cols.length;
    if (allVisible) {
      return [PcGridColumnGroupEnum.tudo];
    }
    return getIterablePcGridColumnGroupEnum([PcGridColumnGroupEnum.tudo]).reduce((acc, key) => {
      if (isVisibleTotal(PcGridColumnGroupEnum[key])) {
        acc.push(PcGridColumnGroupEnum[key]);
      }
      return acc;
    }, []);
  }
}

export const getIterablePcGridColumnGroupEnum = (omit?: PcGridColumnGroupEnum[]) => {
  let items = Object.keys(PcGridColumnGroupEnum).filter(key => !isNaN(Number(PcGridColumnGroupEnum[key])));
  if (omit?.length) {
    items = items.filter(key => !omit.includes(PcGridColumnGroupEnum[key]));
  }
  return items;
};
