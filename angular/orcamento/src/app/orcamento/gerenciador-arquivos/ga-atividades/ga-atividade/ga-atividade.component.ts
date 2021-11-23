import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { collapseAnimation } from '../../../../shared/animations/collapse';
import { GerenciadorArquivosService } from '../../gerenciador-arquivos.service';
import { GaAtividade } from '../../model/atividade';

@Component({
  selector: 'app-ga-atividade',
  templateUrl: './ga-atividade.component.html',
  styleUrls: ['./ga-atividade.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class GaAtividadeComponent implements OnInit {
  constructor(private gerenciadorArquivosService: GerenciadorArquivosService) {}

  @Input() atividade: GaAtividade;

  collapse(): void {
    this.gerenciadorArquivosService
      .toggleCollapseAtividade(this.gerenciadorArquivosService.idOrcamentoGrupo, this.atividade)
      .subscribe();
  }

  ngOnInit(): void {}
}
