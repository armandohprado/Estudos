// tslint:disable:max-line-length
import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { Pavimento } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/pavimento';
import { CentroCusto } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/centro-custo';
import { DefinicaoEscopoService } from '../../../definicao-escopo/definicao-escopo.service';
import { DeDistribuirQuantitativoService } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/de-distribuir-quantitativo.service';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { DefinicaoEscopoGrupoTecnicoService } from '../../definicao-escopo-grupo-tecnico.service';
import { Observable } from 'rxjs';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';
import { finalize, tap } from 'rxjs/operators';
import { InclusaoGrupoItemQuantitativo } from '../../../definicao-escopo/model/atualizacao-quantitativo';
import { isNil } from 'lodash-es';
import { UpdateGrupoItemFilhoQuantitativo } from './update-grupo-item-filho-quantitativo';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { DeleteAmbientesSelecionadosIfNoValue } from './delete-ambientes-selecionados-if-no-value';
import { getPaiFilho } from './utils';
import { SetGrupoItemFilhosApi } from './set-grupo-item-filhos-api';
import { catchAndThrow, refresh } from '@aw-utils/rxjs/operators';
import { RefreshQuantitativos } from './refresh-quantitativos';

export class UpdateGrupoItemFilhoQuantitativoApi
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState>
{
  static readonly type = '[DefinicaoEscopoGrupoTecnico] UpdateGrupoItemFilhoQuantitativoApi';

  constructor(
    public idOrcamentoGrupoItemPai: number,
    public idOrcamentoGrupoItem: number,
    public idFase: number,
    public pavimento: Pavimento,
    public centroCusto: CentroCusto,
    public qtde: number,
    public forcarExclusao = false
  ) {}

  stateContext: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>;
  definicaoEscopoService: DefinicaoEscopoService;
  definicaoEscopoGrupoTecnicoService: DefinicaoEscopoGrupoTecnicoService;
  deDistribuirQuantitativoService: DeDistribuirQuantitativoService;

  action(
    ctx: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    { definicaoEscopoGrupoTecnicoService, deDistribuirQuantitativoService }: DefinicaoEscopoGrupoTecnicoState
  ): Observable<InclusaoGrupoItemQuantitativo | GenericResponse> {
    this.stateContext = ctx;
    this.deDistribuirQuantitativoService = deDistribuirQuantitativoService;
    this.definicaoEscopoService = definicaoEscopoGrupoTecnicoService.definicaoEscopoService;
    this.definicaoEscopoGrupoTecnicoService = definicaoEscopoGrupoTecnicoService;
    this.setQuantitativoLoading(true);
    this.deDistribuirQuantitativoService.emitLoading(
      this.idOrcamentoGrupoItem,
      this.idFase,
      this.pavimento.idProjetoEdificioPavimento,
      this.centroCusto.idProjetoCentroCusto,
      true
    );
    let request$: Observable<InclusaoGrupoItemQuantitativo | GenericResponse>;
    if (isNil(this.qtde)) {
      request$ = this.deleteQuantitativo();
    } else {
      request$ = this.updateQuantitativo();
    }
    const [grupoItemPai] = getPaiFilho(
      ctx.getState().grupoItens,
      this.idOrcamentoGrupoItemPai,
      this.idOrcamentoGrupoItem
    );
    return request$.pipe(
      finalize(() => {
        this.setQuantitativoLoading(false);
      }),
      tap(() => {
        this.deDistribuirQuantitativoService.emitLoading(
          this.idOrcamentoGrupoItem,
          this.idFase,
          this.pavimento.idProjetoEdificioPavimento,
          this.centroCusto.idProjetoCentroCusto,
          false,
          this.qtde
        );
        ctx
          .dispatch(new SetGrupoItemFilhosApi(grupoItemPai.idOrcamentoGrupoItem, grupoItemPai.idGrupoItem))
          .pipe(
            refresh(
              ctx.dispatch(new RefreshQuantitativos(grupoItemPai.idOrcamentoGrupoItem, this.idOrcamentoGrupoItem))
            )
          );
      }),
      catchAndThrow(() => {
        this.deDistribuirQuantitativoService.emitLoading(
          this.idOrcamentoGrupoItem,
          this.idFase,
          this.pavimento.idProjetoEdificioPavimento,
          this.centroCusto.idProjetoCentroCusto,
          false
        );
      })
    );
  }

  setQuantitativoLoading(loading: boolean): void {
    this.stateContext.dispatch(
      new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, grupoItem => ({
        ...grupoItem,
        quantitativo: { ...grupoItem.quantitativo, loading },
      }))
    );
  }

  deleteQuantitativo(): Observable<GenericResponse> {
    return this.definicaoEscopoService
      .deleteQuantitativo(this.centroCusto.idOrcamentoGrupoItemQuantitativo, this.forcarExclusao, true, {
        dataCadastro: new Date().toISOString(),
        idFase: this.centroCusto.idFase,
        idOrcamentoGrupoItem: this.centroCusto.idOrcamentoGrupoItem,
        idOrcamentoGrupoItemQuantitativo: this.centroCusto.idOrcamentoGrupoItemQuantitativo,
        idProjetoCentroCusto: this.centroCusto.idProjetoCentroCusto,
        idProjetoEdificioPavimento: this.centroCusto.idProjetoEdificioPavimento,
        quantidade: 0,
        projetoTecnico: true,
        idGrupo: this.definicaoEscopoGrupoTecnicoService.grupo.idGrupo,
        idOrcamentoGrupo: this.definicaoEscopoGrupoTecnicoService.grupo.idOrcamentoGrupo,
      })
      .pipe(
        tap(() => {
          this.stateContext.dispatch([
            new UpdateGrupoItemFilhoQuantitativo(
              this.idOrcamentoGrupoItemPai,
              this.idOrcamentoGrupoItem,
              this.idFase,
              this.pavimento,
              this.centroCusto.idProjetoCentroCusto,
              {
                ativo: false,
                idOrcamentoGrupoItemQuantitativo: 0,
                quantidadeReferencia: 0,
              }
            ),
            new DeleteAmbientesSelecionadosIfNoValue(
              this.idOrcamentoGrupoItemPai,
              this.idOrcamentoGrupoItem,
              this.pavimento
            ),
          ]);
        }),
        catchAndThrow((response: GenericResponse) => {
          if (response.codigo === 2) {
            this.definicaoEscopoService.awDialogService.warning({
              title: 'Atenção',
              content: response.mensagem,
              primaryBtn: {
                title: 'Excluir',
                action: bsModalRef =>
                  this.definicaoEscopoService.store
                    .dispatch(
                      new UpdateGrupoItemFilhoQuantitativoApi(
                        this.idOrcamentoGrupoItemPai,
                        this.idOrcamentoGrupoItem,
                        this.idFase,
                        this.pavimento,
                        this.centroCusto,
                        this.qtde,
                        true
                      )
                    )
                    .pipe(
                      finalize(() => {
                        bsModalRef.hide();
                      })
                    ),
              },
              bsModalOptions: { ignoreBackdropClick: true },
            });
          }
        })
      );
  }

  updateQuantitativo(): Observable<InclusaoGrupoItemQuantitativo> {
    const { centroCusto, qtde } = this;
    const payload: InclusaoGrupoItemQuantitativo = {
      dataCadastro: new Date().toISOString(),
      idFase: centroCusto.idFase,
      idOrcamentoGrupoItem: centroCusto.idOrcamentoGrupoItem,
      idOrcamentoGrupoItemQuantitativo: centroCusto.idOrcamentoGrupoItemQuantitativo,
      idProjetoCentroCusto: centroCusto.idProjetoCentroCusto,
      idProjetoEdificioPavimento: centroCusto.idProjetoEdificioPavimento,
      quantidade: qtde,
      projetoTecnico: true,
      idGrupo: this.definicaoEscopoGrupoTecnicoService.grupo.idGrupo,
      idOrcamentoGrupo: this.definicaoEscopoGrupoTecnicoService.grupo.idOrcamentoGrupo,
    };
    return (
      centroCusto.idOrcamentoGrupoItemQuantitativo
        ? this.definicaoEscopoService.updateQuantitativo(payload, true)
        : this.definicaoEscopoService.incluirQuantitativo(payload, true)
    ).pipe(
      tap(({ idOrcamentoGrupoItemQuantitativo, dataCadastro }) => {
        this.stateContext.dispatch(
          new UpdateGrupoItemFilhoQuantitativo(
            this.idOrcamentoGrupoItemPai,
            this.idOrcamentoGrupoItem,
            this.idFase,
            this.pavimento,
            centroCusto.idProjetoCentroCusto,
            {
              ativo: true,
              quantidadeReferencia: qtde,
              idOrcamentoGrupoItemQuantitativo,
              dataCadastro,
            }
          )
        );
      })
    );
  }
}
