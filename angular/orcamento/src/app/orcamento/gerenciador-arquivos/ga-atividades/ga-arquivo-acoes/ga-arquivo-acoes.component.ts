import { ChangeDetectionStrategy, Component, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { GaArquivo, GaArquivoVersao } from '../../model/atividade';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { GerenciadorArquivosService } from '../../gerenciador-arquivos.service';
import { WINDOW_TOKEN } from '../../../../shared/tokens/window';
import { FormControl, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AwDialogService } from '../../../../aw-components/aw-dialog/aw-dialog.service';
import { trackByFactory } from '../../../../utils/track-by';

@Component({
  selector: 'app-ga-arquivo-acoes',
  templateUrl: './ga-arquivo-acoes.component.html',
  styleUrls: ['./ga-arquivo-acoes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaArquivoAcoesComponent implements OnInit {
  constructor(
    public gerenciadorArquivosService: GerenciadorArquivosService,
    @Inject(WINDOW_TOKEN) private window: Window,
    private bsModalService: BsModalService,
    private awDialogService: AwDialogService
  ) {}

  @ViewChild('superarModalRef', { read: TemplateRef }) superarModalTemplate: TemplateRef<any>;

  @Input() arquivo: GaArquivo;

  trackByVersao = trackByFactory<GaArquivoVersao>('versao');

  comentarioControl = new FormControl('', [Validators.required]);
  superarModal: BsModalRef;

  openInfo(versao: GaArquivoVersao, popover: PopoverDirective): void {
    if (this.gerenciadorArquivosService.readonly && !this.arquivo.checked) {
      return;
    }
    if (versao.info) {
      popover.show();
    } else {
      this.gerenciadorArquivosService
        .getVersaoInfo(this.arquivo.idAtividadeStore, this.arquivo.id, versao.versao)
        .subscribe(() => {
          popover.show();
        });
    }
  }

  download(versao: string): void {
    if (this.gerenciadorArquivosService.readonly && !this.arquivo.checked) {
      return;
    }
    const url = `${this.gerenciadorArquivosService.target}/arquivos/${this.arquivo.id}/download?versao=${versao}`;
    this.window.open(url, '_blank');
  }

  openSuperarModal(): void {
    this.comentarioControl.reset('');
    this.superarModal = this.bsModalService.show(this.superarModalTemplate, { class: 'ga-modal-superar' });
  }

  superar(): void {
    if (this.comentarioControl.invalid) {
      return;
    }
    this.gerenciadorArquivosService.superar(this.arquivo, this.comentarioControl.value);
    this.awDialogService.success({
      title: 'Documento atualizado',
      content:
        'Os fornecedores serão notificados assim que todas as alterações forem concluídas e o botão “enviar arquivos” for acionado.',
    });
    this.superarModal.hide();
  }

  ngOnInit(): void {}
}
