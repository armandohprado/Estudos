import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EpFornecedor } from '../model/fornecedor';
import { EpPropostaItemQuery } from '../state/item/ep-proposta-item.query';
import { trackByEpFornecedor } from '../utils';

@Component({
  selector: 'app-ep-header-totais',
  templateUrl: './ep-header-totais.component.html',
  styleUrls: ['./ep-header-totais.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpHeaderTotaisComponent {
  constructor(public epPropostaItemQuery: EpPropostaItemQuery) {}

  @Input() fornecedores: EpFornecedor[] = [];
  @Input() idOrcamentoGrupo: number;
  @Input() idOrcamentoCenario: number;

  trackByEpFornecedor = trackByEpFornecedor;
}
