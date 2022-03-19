import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CnGrupo } from '../../../../../../../../models/cn-grupo';
import { FormControl, Validators } from '@angular/forms';
import { CcGrupoService } from '../../../../../../../state/grupos/cc-grupo.service';
import { finalize, tap } from 'rxjs/operators';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

@Component({
  selector: 'app-modal-miscellaneous',
  templateUrl: './modal-miscellaneous.component.html',
  styleUrls: ['./modal-miscellaneous.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalMiscellaneousComponent {
  constructor(
    public bsModalRef: BsModalRef,
    private ccGruposService: CcGrupoService,
    private awDialogService: AwDialogService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() grupo: CnGrupo;

  readonly miscellaneousControl = new FormControl(0, [Validators.required]);

  saldo = 0;
  loading = false;

  salvar(): void {
    const valor: number = this.miscellaneousControl.value;
    if (valor <= 0) {
      return;
    }
    this.loading = true;
    this.miscellaneousControl.disable();
    this.ccGruposService
      .postMiscellaneous(this.grupo.idCompraNegociacaoGrupo, valor)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
          this.miscellaneousControl.enable();
        }),
        tap(() => {
          this.awDialogService.success({
            title: 'Valor miscellaneous enviado com sucesso!',
            secondaryBtn: {
              title: 'Fechar',
              action: bsModalRef => {
                bsModalRef.hide();
                this.bsModalRef.hide();
              },
            },
          });
        }),
        catchAndThrow(err => {
          this.awDialogService.error(err?.error?.mensagem ?? 'Erro ao tentar enviar o valor de miscellaneous!');
        })
      )
      .subscribe();
  }
}
