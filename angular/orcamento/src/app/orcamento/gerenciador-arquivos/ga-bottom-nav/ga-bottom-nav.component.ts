import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GaAtividadeQuery } from '../state/atividade/ga-atividade.query';
import { GaEtapaQuery } from '../state/etapa/ga-etapa.query';
import { collapseAnimation } from '../../../shared/animations/collapse';
import { GerenciadorArquivosService } from '../gerenciador-arquivos.service';
import { AwDialogService } from '../../../aw-components/aw-dialog/aw-dialog.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-ga-bottom-nav',
  templateUrl: './ga-bottom-nav.component.html',
  styleUrls: ['./ga-bottom-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class GaBottomNavComponent implements OnInit {
  constructor(
    public gaAtividadeQuery: GaAtividadeQuery,
    public gaEtapaQuery: GaEtapaQuery,
    public changeDetectorRef: ChangeDetectorRef,
    private gerenciadorArquivosService: GerenciadorArquivosService,
    private awDialogService: AwDialogService
  ) {}

  isOpen = true;
  loading = false;

  cancelarEnvio(): void {
    this.awDialogService.warning({
      title: 'Tem certeza que deseja cancelar o envio?',
      primaryBtn: {
        action: bsModalRef => {
          this.gerenciadorArquivosService.cancelarEnvio();
          this.awDialogService.success('Envio cancelado com sucesso!');
          bsModalRef.hide();
        },
        title: 'Cancelar envio',
      },
      secondaryBtn: { title: 'Voltar' },
    });
  }

  superar(): void {
    if (this.gerenciadorArquivosService.readonly) {
      return;
    }
    this.awDialogService.warning({
      title: 'Tem certeza que deseja enviar?',
      primaryBtn: {
        title: 'Enviar',
        action: bsModalRef => {
          bsModalRef.hide();
          this.loading = true;
          this.gerenciadorArquivosService
            .superarApi()
            .pipe(
              finalize(() => {
                this.loading = false;
                this.changeDetectorRef.markForCheck();
                this.awDialogService.success({ title: 'Enviado com sucesso!' });
              })
            )
            .subscribe();
        },
      },
    });
  }

  ngOnInit(): void {}
}
