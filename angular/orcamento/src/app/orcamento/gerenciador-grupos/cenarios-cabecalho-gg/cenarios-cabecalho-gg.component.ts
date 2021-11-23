import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GerenciadorGruposQuery } from '../state/gerenciador-grupos.query';
import { trackByFactory } from '@aw-utils/track-by';
import { CenarioGG } from '../state/gerenciador-grupo.model';
import { CenarioStatusEnum } from '@aw-models/cenario';

@Component({
  selector: 'app-cenarios-cabecalho-gg',
  templateUrl: './cenarios-cabecalho-gg.component.html',
  styleUrls: ['../gerenciador-grupos.component.scss', 'cenarios-cabecalho-gg.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CenariosCabecalhoGgComponent {
  constructor(public gerenciadorGruposQuery: GerenciadorGruposQuery) {}
  trackByCenario = trackByFactory<CenarioGG>('idOrcamentoCenario');
  cenarioStatusEnum = CenarioStatusEnum;
}
