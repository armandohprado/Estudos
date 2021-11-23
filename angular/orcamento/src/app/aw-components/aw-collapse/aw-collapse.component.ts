import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
} from '@angular/core';
import { collapseNamedAnimation, skipFirstAnimation } from '@aw-shared/animations/collapse';
import { CollapseHeaderDirective } from './collapse-header.directive';
import { AnimationEvent } from '@angular/animations';

export type AwCollapseBackground = 'primary' | 'secondary' | 'tertiary' | 'quaternary';
export type AwCollapseColor = 'white' | 'black' | 'blue';
export type AwCollapseBackgroundCorpo = 'white' | 'gray';
export type AwCollapseSize = 'default' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'aw-collapse',
  templateUrl: './aw-collapse.component.html',
  styleUrls: ['./aw-collapse.component.scss'],
  animations: [collapseNamedAnimation(), skipFirstAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'aw-collapse',
  host: { class: 'aw-collapse' },
})
export class AwCollapseComponent implements OnChanges {
  private _awCollapse = true;

  @Input()
  get awCollapse(): boolean {
    return this._awCollapse;
  }
  set awCollapse(value: boolean) {
    this._awCollapse = value;
  }

  @Output() readonly expanded = new EventEmitter<boolean>();

  @Input() title: string;
  @Input() sizeTitle: AwCollapseSize = 'default';
  @Input() icon = '';
  @Input() bg: AwCollapseBackground = 'primary';
  @Input() border = false;
  @Input() colorFont: AwCollapseColor = 'blue';
  @Input() bgBody: AwCollapseBackgroundCorpo = null;

  @ContentChildren(CollapseHeaderDirective) readonly collapseHeader: QueryList<CollapseHeaderDirective>;

  realCollapse = true;

  collapseToggle(collToggle: boolean): void {
    this._awCollapse = collToggle;
    if (!this._awCollapse) {
      this.realCollapse = this._awCollapse;
    }
    this.expanded.emit(!collToggle);
  }

  animationDone(event: AnimationEvent): void {
    if (event.toState === 'collapsed') {
      this.realCollapse = !this.realCollapse;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const awCollapseChange = changes.awCollapse;
    if (awCollapseChange && (awCollapseChange.isFirstChange() || !awCollapseChange.currentValue)) {
      this.realCollapse = awCollapseChange.currentValue;
    }
  }
}
