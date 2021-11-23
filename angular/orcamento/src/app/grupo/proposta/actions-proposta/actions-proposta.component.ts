import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { coerceArray } from '@angular/cdk/coercion';
import { ModalUploadPropostaComponent } from '../../modal-upload-proposta/modal-upload-proposta.component';
import { finalize, tap } from 'rxjs/operators';
import { ModalHistoricoPropostaComponent } from '../../modal-historico-proposta/modal-historico-proposta.component';
import { environment } from '../../../../environments/environment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { lastValueFrom } from 'rxjs';
import { EnvioDeCotacaoService } from '@aw-services/cotacao/envio-de-cotacao.service';
import { CotacaoService } from '@aw-services/cotacao/cotacao.service';
import { EnvioCotacaoModalService } from '../../modal-envio-de-cotacao/envio-cotacao-modal.service';
import { ReportsService } from '@aw-services/reports/reports.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DefinicaoEscopoModalService } from '../../definicao-escopo/definicao-escopo-modal.service';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { GrupoAlt } from '@aw-models/grupo-alt';
import { PropostaAlt } from '@aw-models/proposta-alt';

@Component({
  selector: 'app-actions-proposta',
  templateUrl: './actions-proposta.component.html',
  styleUrls: ['./actions-proposta.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsPropostaComponent {
  constructor(
    private bsModalService: BsModalService,
    private awDialogService: AwDialogService,
    private envioDeCotacaoService: EnvioDeCotacaoService,
    private cotacaoService: CotacaoService,
    private envioCotacaoModalService: EnvioCotacaoModalService,
    private reportsService: ReportsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private definicaoEscopoModalService: DefinicaoEscopoModalService,
    private changeDetectorRef: ChangeDetectorRef,
    private cenariosService: CenariosService
  ) {}

  @Input() proposta: PropostaAlt;
  @Output() readonly propostaChange = new EventEmitter<PropostaAlt>();

  @Input() idProjeto: number;
  @Input() idOrcamento: number;
  @Input() idOrcamentoCenario: number;
  @Input() devolucaoPropostaRouterLink: any[] | string;
  @Input() showLinkLoginTemporario: boolean;
  @Input() routerLinkQueryParams: Params = {};

  @Input() grupo: GrupoAlt;

  @Input() isControleCompras = false;

  readonly homolog = environment.homolog;
  readonly dev = environment.dev;

  loadingEnvioCotacao = false;
  loading = false;

  readonly urlLoginTemporario = `${environment.centralizacao}projetos/web/Fornecedores/SolicitarLoginTemporario.aspx`;

  async envioCotacao(): Promise<void> {
    this.loadingEnvioCotacao = true;
    const hasEscopo = await lastValueFrom(this.envioDeCotacaoService.hasEscopo(this.grupo.idOrcamentoGrupo));
    if (hasEscopo) {
      await this.envioCotacaoModalService.showModal({
        grupo: this.grupo,
        idProjeto: this.idProjeto,
        reenvio: this.checkPropostas(),
        idFornecedorAtual: this.proposta.fornecedor.idFornecedor,
        idOrcamento: this.grupo.idOrcamento,
        idOrcamentoCenario: this.idOrcamentoCenario,
        isControleCompras: this.isControleCompras,
      });
    } else {
      this.awDialogService.error({
        title: 'Esse grupo não possui escopo',
        content: 'Favor selecionar itens na Definição de escopo antes de enviar a cotação',
        primaryBtn: {
          title: 'Abrir Definição de escopo',
          action: bsModalRef => {
            return this.openModalDefinicaoEscopo().finally(() => {
              bsModalRef.hide();
            });
          },
        },
      });
    }
    this.loadingEnvioCotacao = false;
    this.changeDetectorRef.markForCheck();
  }

  async openModalDefinicaoEscopo(): Promise<void> {
    await this.definicaoEscopoModalService.openModalDefinicaoEscopo(
      this.idProjeto,
      this.grupo,
      this.cenariosService.getCenarioPadraoSnapshot(),
      this.idOrcamentoCenario,
      this.checkPropostas(),
      undefined,
      this.isControleCompras
    );
  }

  navigate(commands: string | any[]): void {
    this.router
      .navigate(coerceArray(commands), {
        queryParams: { ...this.routerLinkQueryParams, [RouteParamEnum.idOrcamentoGrupo]: this.grupo.idOrcamentoGrupo },
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'merge',
      })
      .then();
  }

  relatorioProposta(): void {
    this.reportsService
      .Proposta({ IdProjeto: this.idProjeto, IdProposta: this.proposta.idProposta })
      .open(true, 'noopener noreferrer');
  }

  navigateDevolucaoProposta(): void {
    this.navigate([...coerceArray(this.devolucaoPropostaRouterLink), this.proposta.idProposta, 'interno']);
  }

  checkPropostas(): boolean {
    return this.grupo.propostas.some(proposta => !proposta.fornecedor.fornecedorInterno);
  }

  openModalUploadProposta(): void {
    const { codigoGrupo, nomeGrupo, idGrupo } = this.grupo;
    const { nomeFantasia } = this.proposta.fornecedor;

    this.bsModalService.show(ModalUploadPropostaComponent, {
      class: 'modal-lg',
      ignoreBackdropClick: true,
      initialState: {
        proposta: this.proposta,
        nomeFantasia,
        codigoGrupo,
        nomeGrupo,
        idGrupo,
        idOrcamento: this.idOrcamento,
      },
    });
  }

  hideProposta(): void {
    const proposta = this.proposta;
    this.loading = true;
    this.cotacaoService
      .toggleProposta(this.idOrcamento, this.grupo.idOrcamentoGrupo, proposta.idProposta, !proposta.desativaProposta)
      .pipe(
        tap(() => {
          this.propostaChange.emit({ ...proposta, desativaProposta: !proposta.desativaProposta });
          this.proposta = { ...this.proposta, desativaProposta: !proposta.desativaProposta };
        }),
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  openModalHisoricoProposta(): void {
    this.bsModalService.show(ModalHistoricoPropostaComponent, {
      class: 'modal-lg',
      ignoreBackdropClick: true,
      initialState: {
        idProposta: this.proposta.idProposta,
        grupo: this.grupo,
        nomeFantasia: this.proposta.fornecedor.nomeFantasia,
        idOrcamento: this.idOrcamento,
      },
    });
  }
}
