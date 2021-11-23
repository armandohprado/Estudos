import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from '@angular/core';
import { WrapperHeaderDirective } from './wrapper-header.directive';

@Component({
  selector: 'aw-wrapper-header',
  templateUrl: './wrapper-header.component.html',
  styleUrls: ['./wrapper-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WrapperHeaderComponent {
  @Input() titulo: string;
  @Input() subTitulo: string;

  @ContentChildren(WrapperHeaderDirective) headerRef: QueryList<WrapperHeaderDirective>;

  @Output() voltar = new EventEmitter<MouseEvent>();
}
