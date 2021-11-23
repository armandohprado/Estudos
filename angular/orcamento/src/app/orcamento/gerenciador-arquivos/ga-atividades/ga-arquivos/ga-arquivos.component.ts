import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GaArquivo, GaAtividade } from '../../model/atividade';
import { GerenciadorArquivosService } from '../../gerenciador-arquivos.service';
import { GaAtividadeQuery } from '../../state/atividade/ga-atividade.query';
import { collapseAnimation } from '../../../../shared/animations/collapse';
import { trackByFactory } from '../../../../utils/track-by';

@Component({
  selector: 'app-ga-arquivos',
  templateUrl: './ga-arquivos.component.html',
  styleUrls: ['./ga-arquivos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class GaArquivosComponent implements OnInit {
  constructor(
    public gerenciadorArquivosService: GerenciadorArquivosService,
    public gaAtividadeQuery: GaAtividadeQuery
  ) {}

  @Input() atividade: GaAtividade;

  trackByArquivo = trackByFactory<GaArquivo>('id');

  toggleArquivo(arquivo: GaArquivo): void {
    if (this.gerenciadorArquivosService.readonly) {
      return;
    }
    this.gerenciadorArquivosService
      .toggleArquivo(this.gerenciadorArquivosService.idOrcamentoGrupo, arquivo)
      .subscribe();
  }

  toggleCollapseArquivo(arquivo: GaArquivo): void {
    this.gerenciadorArquivosService.toggleCollapseArquivo(arquivo).subscribe();
  }

  ngOnInit(): void {}
}
