import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { ChangeOrderService } from '../services/change-order.service';
import { ChangeOrder } from '../models/change-order';
import { FormControl, Validators } from '@angular/forms';
import { finalize, tap } from 'rxjs/operators';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

@Component({
  selector: 'app-modal-aprovar-change-order',
  templateUrl: './modal-aprovar-change-order.component.html',
  styleUrls: ['./modal-aprovar-change-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalAprovarChangeOrderComponent {
  constructor(
    public bsModalRef: BsModalRef,
    private awDialogService: AwDialogService,
    private changeOrderService: ChangeOrderService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() changeOrder: ChangeOrder;
  @Input() idStatus: number;

  loading = false;

  fileControl = new FormControl(null, [Validators.required]);

  aprovar(): void {
    if (this.fileControl.invalid) {
      return;
    }
    this.loading = true;
    this.changeOrderService
      .aprovarChangeOrder(this.changeOrder, this.fileControl.value)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        }),
        catchAndThrow(err => {
          this.awDialogService.error(
            'Erro ao tentar fazer o upload',
            err?.error?.mensagem ?? 'Tente novamente mais tarde'
          );
        }),
        tap(() => {
          this.awDialogService.success('Upload realizado com sucesso!', 'Change Order aprovada.', {
            secondaryBtn: {
              action: bsModalRef => {
                bsModalRef.hide();
                this.bsModalRef.hide();
              },
            },
          });
        })
      )
      .subscribe();
  }
}
