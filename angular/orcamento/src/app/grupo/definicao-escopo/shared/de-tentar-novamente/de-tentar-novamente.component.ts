import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ErrorApiMoreInfo } from '../../model/error-api';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-de-tentar-novamente',
  templateUrl: './de-tentar-novamente.component.html',
  styleUrls: ['./de-tentar-novamente.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeTentarNovamenteComponent implements OnInit {
  constructor(private bsModalService: BsModalService) {}

  _col = 'col';

  @Input() type: string;

  @Input()
  set col(col: string) {
    this._col = `col${col ? '-' + col : ''}`;
  }

  @Input() moreInfo: ErrorApiMoreInfo;

  @Output() tentarNovamente = new EventEmitter<void>();

  bsModalRef: BsModalRef;

  openModalMoreInfo(modal: any): void {
    this.bsModalRef = this.bsModalService.show(modal, { class: 'modal-md' });
  }

  ngOnInit(): void {
    if (!this.type) this.type = 'danger';
  }
}
