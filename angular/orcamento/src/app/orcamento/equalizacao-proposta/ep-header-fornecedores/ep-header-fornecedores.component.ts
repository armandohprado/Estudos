import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EpPropostaItemQuery } from '../state/item/ep-proposta-item.query';
import { EpFornecedor } from '../model/fornecedor';
import { EqualizacaoPropostaService } from '../equalizacao-proposta.service';
import { trackByEpFornecedor } from '../utils';

@Component({
  selector: 'app-ep-header-fornecedores',
  templateUrl: './ep-header-fornecedores.component.html',
  styleUrls: ['./ep-header-fornecedores.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpHeaderFornecedoresComponent {
  constructor(
    public epPropostaItemQuery: EpPropostaItemQuery,
    private equalizacaoPropostaService: EqualizacaoPropostaService
  ) {}

  @Input() fornecedores: EpFornecedor[] = [];
  @Input() idOrcamentoCenario: number;
  @Input() idOrcamento: number;
  @Input() idProjeto: number;
  @Input() idOrcamentoGrupo: number;

  trackByEpFornecedor = trackByEpFornecedor;

  toggleCollapse(): void {
    this.equalizacaoPropostaService.toggleCollapseHeaderFornecedor();
  }
}
