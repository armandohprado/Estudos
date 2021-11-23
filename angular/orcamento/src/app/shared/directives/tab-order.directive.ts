import { Directive, Inject, Input } from '@angular/core';
import { TabDirective } from 'ngx-bootstrap/tabs';

export interface TabDirectiveCustom extends TabDirective {
  __order__?: number;
}

@Directive({
  selector: 'tab[tabOrder], [tab][tabOrder]',
})
export class TabOrderDirective {
  constructor(@Inject(TabDirective) private tab: TabDirectiveCustom) {}

  private _tabOrder: number;

  @Input() set tabOrder(order: number) {
    this._tabOrder = order;
    this.tab.__order__ = order;
    this.tab.tabset.tabs.sort((a: TabDirectiveCustom, b: TabDirectiveCustom) => {
      return a.__order__ - b.__order__;
    });
  }
}
