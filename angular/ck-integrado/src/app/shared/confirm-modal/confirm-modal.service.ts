import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ConfirmModalComponent, ConfirmModalOptions } from './confirm-modal.component';

@Injectable()
export class ConfirmModalService {
  constructor(private bsModalService: BsModalService) {}

  open(
    options: ConfirmModalOptions,
    modalOptions?: ModalOptions<ConfirmModalOptions>
  ): BsModalRef<ConfirmModalComponent> {
    return this.bsModalService.show(ConfirmModalComponent, { backdrop: true, ...modalOptions, initialState: options });
  }
}
