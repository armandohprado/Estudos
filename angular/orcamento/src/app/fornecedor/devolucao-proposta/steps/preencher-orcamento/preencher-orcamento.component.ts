import { ActivatedRoute } from '@angular/router';
import { Component, Input } from '@angular/core';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';
import { DataDevolucaoPropostaService } from '@aw-services/devolucao-proposta/data-devolucao-proposta.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { finalize, tap } from 'rxjs/operators';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { CabecalhoDevolucaoProposta } from '@aw-models/devolucao-proposta/cabecalho-devolucao-proposta';

@Component({
  selector: 'app-preencher-orcamento',
  templateUrl: './preencher-orcamento.component.html',
  styleUrls: ['./preencher-orcamento.component.scss'],
})
export class PreencherOrcamentoComponent {
  constructor(
    private dataDevolucaoProposta: DataDevolucaoPropostaService,
    public devolucaoProposta: DevolucaoPropostaService,
    private activatedRoute: ActivatedRoute,
    private awDialogService: AwDialogService
  ) {}

  @Input() interno: boolean;
  @Input() supply: boolean;
  @Input() cabecalho: CabecalhoDevolucaoProposta;

  salvando = false;

  salvarSupply(): void {
    if (!this.supply) {
      return;
    }
    this.salvando = true;
    const { idProposta } = this.cabecalho;
    const idCompraNegociacaoGrupoMapaFornecedor =
      this.cabecalho.idCompraNegociacaoGrupoMapaFornecedor ??
      +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor);
    this.dataDevolucaoProposta
      .salvarSupply(idProposta, idCompraNegociacaoGrupoMapaFornecedor)
      .pipe(
        catchAndThrow(() => {
          this.awDialogService.error('Erro ao tentar enviar proposta!', 'Favor tentar novamente mais tarde');
        }),
        tap(() => {
          this.awDialogService.success('Proposta enviada com sucesso!');
        }),
        finalize(() => {
          this.salvando = false;
        })
      )
      .subscribe();
  }
}
