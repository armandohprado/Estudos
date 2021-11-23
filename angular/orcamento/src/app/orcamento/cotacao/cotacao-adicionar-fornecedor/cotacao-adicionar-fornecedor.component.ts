import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { GrupoAlt } from '../../../models';
import { finalize } from 'rxjs/operators';
import { FornecedorService } from '@aw-services/orcamento/fornecedor.service';
import { ControleComprasQuery } from '../../../compra/controle-compras/state/controle-compras/controle-compras.query';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { AdicionarFornecedorResumo } from '@aw-shared/adicionar-fornecedor/adicionar-fornecedor-resumo/adicionar-fornecedor-resumo.component';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { FornecedorFichaPayload } from '../../../compra/models/cn-ficha-payload';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';
import { RouteDataEnum } from '@aw-models/route-data.enum';

@Component({
  selector: 'app-cotacao-adicionar-fornecedor',
  templateUrl: './cotacao-adicionar-fornecedor.component.html',
  styleUrls: ['./cotacao-adicionar-fornecedor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotacaoAdicionarFornecedorComponent {
  constructor(
    private fornecedorService: FornecedorService,
    public controleComprasQuery: ControleComprasQuery,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private awDialogService: AwDialogService,
    private projetoService: ProjetoService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  readonly projeto$ = this.projetoService.projeto$;
  readonly grupo: GrupoAlt = this.activatedRoute.snapshot.data[RouteDataEnum.grupoAlt];

  loading = false;

  voltar(): void {
    this.router
      .navigate(['../../'], {
        relativeTo: this.activatedRoute,
        queryParams: {
          [RouteParamEnum.idOrcamentoGrupo]: this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoGrupo),
        },
        queryParamsHandling: 'merge',
      })
      .then();
  }

  submeterAprovacao({ motivo, arquivos, detalhe, fornecedor, tipo }: AdicionarFornecedorResumo): void {
    const { idFichaArea, idFichaCausa } = motivo;
    const { idFornecedor } = fornecedor;
    const { idGrupo, idOrcamentoGrupo } = this.grupo;

    const idProjeto = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idProjeto);
    const payload: FornecedorFichaPayload = {
      orcamentoGrupoFichaArquivo: arquivos.map(({ idUpload }) => ({ idUpload })),
      orcamentoGrupoFichaTipoAreaCausa: [{ idFichaArea, idFichaCausa, idOrcamentoGrupoFichaTipo: tipo }],
      detalhe,
      idOrcamentoGrupo,
      idFornecedor,
      idGrupo,
      idProjeto,
    };
    this.loading = true;
    this.fornecedorService
      .enviarFicha(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        }),
        catchAndThrow(response => {
          this.awDialogService.error(
            'Erro ao tentar enviar para aprovação',
            response?.error?.mensagem ?? 'Favor tentar novamente mais tarde'
          );
        })
      )
      .subscribe(() => {
        this.awDialogService.success({
          title: 'Pedido para inclusão do fornecedor enviado com sucesso!',
          content: 'Aguarde retorno',
          secondaryBtn: null,
          bsModalOptions: { ignoreBackdropClick: true },
          primaryBtn: {
            title: 'Voltar para Cotações',
            action: bsModalRef => {
              bsModalRef.hide();
              this.voltar();
            },
          },
        });
      });
  }
}
