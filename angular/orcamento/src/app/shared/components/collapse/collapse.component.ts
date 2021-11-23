import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  OnInit,
  QueryList,
} from '@angular/core';
import { Collapse } from '../../../models/collapse';
import { CollapseGroupComponent } from './collapse-group.component';

@Component({
  selector: 'app-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapseComponent implements OnInit, AfterContentInit {
  @Input() closeOthers: boolean;
  @Input() openFirst: boolean;

  @ContentChildren(Collapse) collapseSQL: QueryList<Collapse>;

  constructor() {}

  ngOnInit(): void {}

  closeOtherPanels(openGroup: CollapseGroupComponent): void {
    if (!this.closeOthers) {
      return;
    }

    if (this.collapseSQL) {
      setTimeout(() => {
        this.collapseSQL.toArray().forEach((group: CollapseGroupComponent) => {
          if (group !== openGroup) {
            group.hide();
          }
        });
      });
    }
  }

  ngAfterContentInit(): void {}
}
