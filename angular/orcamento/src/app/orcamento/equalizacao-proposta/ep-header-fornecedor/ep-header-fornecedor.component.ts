import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EpFornecedor } from '../model/fornecedor';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { EqualizacaoPropostaService } from '../equalizacao-proposta.service';
import { EnvioCotacaoModalService } from '../../../grupo/modal-envio-de-cotacao/envio-cotacao-modal.service';
import { lastValueFrom } from 'rxjs';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';

@Component({
  selector: 'app-ep-header-fornecedor',
  templateUrl: './ep-header-fornecedor.component.html',
  styleUrls: ['./ep-header-fornecedor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class EpHeaderFornecedorComponent {
  constructor(
    private equalizacaoPropostaService: EqualizacaoPropostaService,
    private envioCotacaoModalService: EnvioCotacaoModalService,
    private orcamentoAltService: OrcamentoAltService
  ) {}

  @Input() fornecedor: EpFornecedor;
  @Input() collapsed = true;
  @Input() idOrcamentoCenario: number;
  @Input() idOrcamento: number;
  @Input() idProjeto: number;
  @Input() idOrcamentoGrupo: number;

  atualizarLastCall(): void {
    if (this.fornecedor.lc) {
      return;
    }
    this.equalizacaoPropostaService.atualizarLastCall(this.fornecedor.idProposta).subscribe();
  }

  async openEnvioCotacao(): Promise<void> {
    this.equalizacaoPropostaService.atualizarFornecedor(() => true, { loadingEnvioCotacao: true });
    const grupo = await lastValueFrom(
      this.orcamentoAltService.getGrupo(this.idOrcamento, this.idOrcamentoCenario, this.idOrcamentoGrupo)
    );
    await this.envioCotacaoModalService.showModal({
      idOrcamentoCenario: this.idOrcamentoCenario,
      idOrcamento: this.idOrcamento,
      idFornecedorAtual: this.fornecedor.idFornecedor,
      idProjeto: this.idProjeto,
      reenvio: true,
      grupo,
    });
    this.equalizacaoPropostaService.atualizarFornecedor(() => true, { loadingEnvioCotacao: false });
  }

  transferir(): void {
    if (this.fornecedor.indicadorAWReferencia) {
      this.equalizacaoPropostaService
        .transferirTotalAwReferenciaParaAwEstimado(
          this.fornecedor.idFornecedor,
          this.idOrcamentoCenario,
          this.idOrcamentoGrupo
        )
        .subscribe();
    } else {
      this.equalizacaoPropostaService
        .transferirTotalParaAwReferencia(this.fornecedor.idFornecedor, this.fornecedor.idProposta)
        .subscribe();
    }
  }
}
