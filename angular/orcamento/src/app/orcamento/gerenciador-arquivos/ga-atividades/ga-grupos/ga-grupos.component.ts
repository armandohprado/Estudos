import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GaArquivo, GaArquivoGrupo } from '../../model/atividade';
import { GerenciadorArquivosService } from '../../gerenciador-arquivos.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { GaAddGruposComponent } from '../ga-add-grupos/ga-add-grupos.component';
import { trackByFactory } from '../../../../utils/track-by';

@Component({
  selector: 'app-ga-grupos',
  templateUrl: './ga-grupos.component.html',
  styleUrls: ['./ga-grupos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaGruposComponent implements OnInit {
  constructor(public gerenciadorArquivosService: GerenciadorArquivosService, private bsModalService: BsModalService) {}

  @Input() arquivo: GaArquivo;

  trackByGrupo = trackByFactory<GaArquivoGrupo>('id');

  deleteGrupo(idOrcamentoGrupo: number): void {
    this.gerenciadorArquivosService.deleteGrupo(this.arquivo, idOrcamentoGrupo).subscribe();
  }

  addGrupos(): void {
    this.bsModalService.show(GaAddGruposComponent, {
      class: 'modal-lg',
      initialState: {
        idArquivo: this.arquivo.id,
        idAtividade: this.arquivo.idAtividadeStore,
        idOrcamentoGrupo: this.gerenciadorArquivosService.idOrcamentoGrupo,
      },
    });
  }

  ngOnInit(): void {}
}
