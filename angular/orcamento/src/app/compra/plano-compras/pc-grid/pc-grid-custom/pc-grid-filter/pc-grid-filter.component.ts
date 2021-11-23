import { Component } from '@angular/core';
import { IFilterAngularComp } from '@ag-grid-community/angular';
import {
  ColDefCustom,
  IDoesFilterPassParamsCustom,
  IFilterParamsCustom,
  RowNodeCustom,
} from '../../../util/grid-custom-models';
import { isNil } from 'lodash-es';
import { AwFilterConditional, AwFilterType } from '../../../../../aw-components/aw-filter/aw-filter.type';
import { awComparator } from '../../../../../aw-components/aw-filter/aw-filter.util';
import { PlanoCompras } from '../../../models/plano-compras';
import { PcGridService } from '../../pc-grid.service';
import { Order } from '../../../../../aw-components/aw-utils/aw-order-by/aw-order-by';

export interface PcGridFilterParams extends IFilterParamsCustom {
  type: AwFilterType;
  ascText?: string;
  descText?: string;
  filterable?: boolean;
  conditional?: boolean;
  filterBy?: string;
  debounceFilter?: number;
  debounceConditional?: number;
  customValueGetter?: <T = any>(data?: PlanoCompras, colDef?: ColDefCustom, node?: RowNodeCustom) => T;
}

@Component({
  selector: 'app-pc-grid-filter',
  templateUrl: './pc-grid-filter.component.html',
  styleUrls: ['./pc-grid-filter.component.scss'],
})
export class PcGridFilterComponent implements IFilterAngularComp {
  constructor(private pcGridService: PcGridService) {}

  params: PcGridFilterParams;
  term: any;
  sort: Order;

  conditional: AwFilterConditional<string | number | Date>;
  type: 'conditional' | 'filter' = 'filter';

  private _getRealFilter(type: string): any {
    return this.pcGridService.realFilterModel[this.params.colDef.field]?.[type];
  }

  agInit(params: PcGridFilterParams): void {
    this.params = params;
  }

  doesFilterPass(params: IDoesFilterPassParamsCustom): boolean {
    const value = this.params.customValueGetter
      ? this.params.customValueGetter(params.data, this.params.colDef as ColDefCustom, params.node)
      : this.params.valueGetter(params.node);
    if (this.type === 'conditional') {
      return awComparator(
        this.params.type,
        this.conditional.condition,
        value,
        this.conditional.term,
        this.conditional.term2
      );
    } else {
      return awComparator(this.params.type, 'contem', value, this.term, null);
    }
  }

  getModel(): any {
    return this.conditional?.term ?? this.term;
  }

  setModel(model: any): void {
    this.term = this._getRealFilter('term');
    this.conditional = this._getRealFilter('conditional');
    this.type = this._getRealFilter('type');
  }

  isFilterActive(): boolean {
    return !isNil(this.conditional?.term ?? this.term);
  }

  onFilter(term: any): void {
    if (term === '' || isNil(term)) {
      this.term = null;
      this.params.column.setFilterActive(false);
      this.pcGridService.realFilterModel[this.params.colDef.field] = null;
    } else {
      this.type = 'filter';
      this.term = term;
      this.pcGridService.realFilterModel[this.params.colDef.field] = {
        term,
        type: this.type,
      };
    }
    this.params.filterChangedCallback();
  }

  onConditionalFilter({ term, condition, term2 }: AwFilterConditional<string | number | Date>): void {
    if (term === '' || isNil(term)) {
      this.conditional = null;
      this.params.column.setFilterActive(false);
      this.pcGridService.realFilterModel[this.params.colDef.field] = null;
    } else {
      this.type = 'conditional';
      this.conditional = { term, term2, condition };
      this.pcGridService.realFilterModel[this.params.colDef.field] = {
        conditional: this.conditional,
        type: this.type,
      };
    }
    this.params.filterChangedCallback();
  }

  onSort(sort: Order): void {
    this.sort = sort;
    this.params.column.setSort(sort);
    this.params.api.onSortChanged();
  }
}
