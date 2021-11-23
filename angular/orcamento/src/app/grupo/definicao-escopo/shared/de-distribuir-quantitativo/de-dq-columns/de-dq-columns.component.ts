import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Pavimento } from '../model/pavimento';
import { trackByFactory } from '@aw-utils/track-by';
import { CentroCusto } from '../model/centro-custo';
import { Entity } from '@aw-utils/types/entity';
import { AtualizacaoCentroCustoEvent } from '../model/atualizacao-centro-custo-event';
import { DistribuirQuantitativoAmbienteEvent } from '../de-distribuir-quantitativo.component';
import { Fase } from '../model/fase';

@Component({
  selector: 'app-de-dq-columns',
  templateUrl: './de-dq-columns.component.html',
  styleUrls: ['./de-dq-columns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeDqColumnsComponent implements OnInit {
  constructor() {}

  @Input() edificio: Pavimento;
  @Input() loading: Entity<boolean> = {};
  @Input() idOrcamentoGrupoItem: number;
  @Input() fase: Fase;
  @Input() quantidadeProperty: 'quantidadeReferencia' | 'quantidadeOrcada';
  @Input() tipoQuantitativo: 'definicao-escopo' | 'devolucao-proposta';
  @Input() sugestaoQtdeReferencia: boolean;
  @Input() enableAmbiente = false;
  @Input() canChangeValue = true;
  @Input() planilhaCliente = false;
  @Output() ambiente = new EventEmitter<DistribuirQuantitativoAmbienteEvent>();
  @Input() total: number;

  @Output() atualizaCentroCusto = new EventEmitter<AtualizacaoCentroCustoEvent>();

  trackByCentroCusto = trackByFactory<CentroCusto>('idProjetoCentroCusto');
  trackByAndar = trackByFactory<Pavimento>('idProjetoEdificioPavimento');

  ngOnInit(): void {}
}
