import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GaEtapaQuery } from '../state/etapa/ga-etapa.query';
import { GerenciadorArquivosService } from '../gerenciador-arquivos.service';
import { GaAtividadeQuery } from '../state/atividade/ga-atividade.query';
import { GaPavimentoQuery } from '../state/pavimento/ga-pavimento.query';
import { GaEtapa } from '../model/etapa';

@Component({
  selector: 'app-ga-form',
  templateUrl: './ga-form.component.html',
  styleUrls: ['./ga-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaFormComponent implements OnInit {
  constructor(
    public gaAtividadeQuery: GaAtividadeQuery,
    public gaEtapaQuery: GaEtapaQuery,
    public gerenciadorArquivosService: GerenciadorArquivosService,
    public gaPavimentoQuery: GaPavimentoQuery
  ) {}

  toggleEtapa(etapa: GaEtapa, $event: boolean): void {
    if (etapa.id === 0 || this.gerenciadorArquivosService.readonly) {
      return;
    }
    this.gerenciadorArquivosService
      .toggleEtapa(this.gerenciadorArquivosService.idProjeto, etapa.id, $event)
      .subscribe();
  }

  toggleOnlySelecionados($event: boolean): void {
    this.gerenciadorArquivosService.toggleOnlySelecionados($event);
  }

  ngOnInit(): void {}
}
