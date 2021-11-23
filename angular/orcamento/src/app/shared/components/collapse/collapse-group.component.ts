import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Collapse } from '@aw-models/collapse';
import { CollapseDirective } from 'ngx-bootstrap/collapse';
import { CollapseComponent } from './collapse.component';

@Component({
  selector: 'app-collapse-group',
  templateUrl: './collapse-group.component.html',
  styleUrls: ['./collapse-group.component.scss'],
  providers: [{ provide: Collapse, useExisting: CollapseGroupComponent }],
})
export class CollapseGroupComponent implements OnInit, Collapse, OnDestroy {
  @Input() isOpen: boolean;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() expand = new EventEmitter<void>();

  @ViewChild('collapse') collapseDirective: CollapseDirective;

  protected collapse: CollapseComponent;

  constructor(@Inject(CollapseComponent) collapse: CollapseComponent) {
    this.collapse = collapse;
  }

  hide(): void {
    this.collapseDirective.hide();
    this.isOpenChange.emit(false);
  }

  ngOnInit(): void {}

  onExpand(): void {
    this.collapse.closeOtherPanels(this);
    this.expand.emit();
  }

  ngOnDestroy(): void {}
}
