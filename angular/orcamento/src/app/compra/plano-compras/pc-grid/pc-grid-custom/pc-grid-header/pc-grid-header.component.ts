import { Component, HostListener } from '@angular/core';
import { IHeaderAngularComp } from '@ag-grid-community/angular';
import { IHeaderParams } from '@ag-grid-community/all-modules';
import { Order } from '../../../../../aw-components/aw-utils/aw-order-by/aw-order-by';

@Component({
  selector: 'app-pc-grid-header',
  templateUrl: './pc-grid-header.component.html',
  styleUrls: ['./pc-grid-header.component.scss'],
})
export class PcGridHeaderComponent implements IHeaderAngularComp {
  constructor() {}

  params: IHeaderParams;

  sort: Order;

  @HostListener('click', ['$event'])
  setSort($event: MouseEvent): void {
    if (!this.params.column.getColDef().sortable) {
      return;
    }
    let sort: Order;
    if (this.params.column.isSortAscending()) {
      sort = 'desc';
    } else if (this.params.column.isSortDescending()) {
      sort = null;
    } else {
      sort = 'asc';
    }
    this._sort(sort, $event);
  }

  agInit(params: IHeaderParams): void {
    this.params = params;
    this.params.column.addEventListener('sortChanged', this.sortChanged.bind(this));
  }

  sortChanged(): void {
    if (this.params.column.isSortAscending()) {
      this.sort = 'asc';
    } else if (this.params.column.isSortDescending()) {
      this.sort = 'desc';
    } else {
      this.sort = null;
    }
  }

  _sort(sort: Order, $event: MouseEvent): void {
    if (this.sort === sort) return;
    this.params.setSort(sort, $event.shiftKey);
  }

  refresh(params: IHeaderParams): boolean {
    return true;
  }
}
