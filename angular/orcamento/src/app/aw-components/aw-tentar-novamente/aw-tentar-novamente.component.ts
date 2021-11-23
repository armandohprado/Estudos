import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ErrorApiMoreInfo } from '../../grupo/definicao-escopo/model/error-api';
import { Predicate } from '@aw-utils/types/predicate';
import { isFunction } from 'lodash-es';
import { AwDialogService } from '../aw-dialog/aw-dialog.service';

@Component({
  selector: 'aw-tentar-novamente',
  templateUrl: './aw-tentar-novamente.component.html',
  styleUrls: ['./aw-tentar-novamente.component.scss'],
})
export class AwTentarNovamenteComponent implements OnInit {
  constructor(private awDialogService: AwDialogService) {}
  @Input() type = 'danger';
  @Input() fn: Predicate;
  @Input() args: any[];
  @Input() moreInfo: ErrorApiMoreInfo;
  @Input() context?: any;

  bsModalRef: BsModalRef;

  tentarNovamente(call: Predicate, args: any[]): void {
    if (isFunction(call)) {
      if (this.context) call.call(this.context, ...args);
      else call(...args);
    }
  }

  openModalMoreInfo(): void {
    const title = this.moreInfo.title + this.moreInfo.code ? `- (${this.moreInfo.code})` : '';
    this.bsModalRef = this.awDialogService.info(title, this.moreInfo.info);
  }

  ngOnInit(): void {}
}
