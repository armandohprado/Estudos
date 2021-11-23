import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'aw-wrapper-page',
  templateUrl: './wrapper-page.component.html',
  styleUrls: ['./wrapper-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WrapperPageComponent implements OnInit {
  constructor() {}

  @Input() titulo: string;
  @Input() subTitulo: string;

  @Output() voltar = new EventEmitter<MouseEvent>();

  ngOnInit(): void {}
}
