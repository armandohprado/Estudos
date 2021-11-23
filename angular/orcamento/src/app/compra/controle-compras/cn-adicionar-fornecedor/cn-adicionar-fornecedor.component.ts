import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { finalize, map, shareReplay } from 'rxjs/operators';
import { CcGrupoQuery } from '../state/grupos/cc-grupo.query';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CnGrupo } from '../../models/cn-grupo';
import { ActivatedRoute, Router } from '@angular/router';
import { ControleComprasQuery } from '../state/controle-compras/controle-compras.query';
import { AdicionarFornecedorResumo } from '@aw-shared/adicionar-fornecedor/adicionar-fornecedor-resumo/adicionar-fornecedor-resumo.component';
import { CcGrupoService } from '../state/grupos/cc-grupo.service';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { CnFichaPayload } from '../../models/cn-ficha-payload';
import { filterNilValue } from '@datorama/akita';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

@Component({
  selector: 'app-cn-adicionar-fornecedor',
  templateUrl: './cn-adicionar-fornecedor.component.html',
  styleUrls: ['./cn-adicionar-fornecedor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnAdicionarFornecedorComponent {
  constructor(
    private ccGruposQuery: CcGrupoQuery,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public controleComprasQuery: ControleComprasQuery,
    private ccGruposService: CcGrupoService,
    private awDialogService: AwDialogService,
    private projetoService: ProjetoService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private readonly _idCompraNegociacaoGrupo$ = this.activatedRoute.paramMap.pipe(
    map(paramMap => paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo)),
    filterNilValue(),
    map(Number),
    shareReplay()
  );
  readonly grupo$: Observable<CnGrupo> = this._idCompraNegociacaoGrupo$.pipe(
    switchMap(idCompraNegociacaoGrupo => this.ccGruposQuery.selectEntity(idCompraNegociacaoGrupo))
  );

  loading = false;

  readonly projeto$ = this.projetoService.projeto$;

  voltar(): void {
    this.router
      .navigate(['../../'], {
        relativeTo: this.activatedRoute,
        queryParams: {
          [RouteParamEnum.idCompraNegociacaoGrupo]: +this.activatedRoute.snapshot.paramMap.get(
            RouteParamEnum.idCompraNegociacaoGrupo
          ),
        },
      })
      .then();
  }

  submeterAprovacao({ motivo, arquivos, detalhe, fornecedor, tipo }: AdicionarFornecedorResumo, grupo: CnGrupo): void {
    const { idFichaArea, idFichaCausa } = motivo;
    const { idFornecedor } = fornecedor;
    const { idCompraNegociacaoGrupo, idGrupo, idOrcamentoGrupo } = grupo;
    const idProjeto = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idProjeto);
    const payload: CnFichaPayload = {
      compraNegociacaoGrupoFichaArquivo: arquivos.map(({ idUpload }) => ({ idUpload })),
      compraNegociacaoGrupoFichaTipoAreaCausa: [{ idFichaArea, idFichaCausa, idCompraNegociacaoGrupoFichaTipo: tipo }],
      compraNegociacaoGrupoFichaTransacao: [],
      detalhe,
      idCompraNegociacaoGrupo,
      idOrcamentoGrupo,
      idFornecedor,
      idGrupo,
      idProjeto,
      compraNegociacaoGrupoFichaTransacaoCC: [],
    };
    this.loading = true;
    this.ccGruposService
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
            title: 'Voltar para Controle de Orçamento',
            action: bsModalRef => {
              bsModalRef.hide();
              this.voltar();
            },
          },
        });
      });
  }
}
