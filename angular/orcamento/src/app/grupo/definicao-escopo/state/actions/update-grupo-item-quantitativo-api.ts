import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { Pavimento } from '../../shared/de-distribuir-quantitativo/model/pavimento';
import { CentroCusto } from '../../shared/de-distribuir-quantitativo/model/centro-custo';
import { StateContext } from '@ngxs/store';
import { Observable } from 'rxjs';
import { InclusaoGrupoItemQuantitativo } from '../../model/atualizacao-quantitativo';
import { isNil } from 'lodash-es';
import { DefinicaoEscopoService } from '../../definicao-escopo.service';
import { GenericResponse } from '../../model/generic-response';
import { finalize, tap } from 'rxjs/operators';
import { UpdateGrupoItemQuantitativo } from './update-grupo-item-quantitativo';
import { DeDistribuirQuantitativoService } from '../../shared/de-distribuir-quantitativo/de-distribuir-quantitativo.service';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

export class UpdateGrupoItemQuantitativoApi implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] UpdateGrupoItemQuantitativoApi';
  constructor(
    public idOrcamentoGrupoItem: number,
    public idFase: number,
    public pavimento: Pavimento,
    public centroCusto: CentroCusto,
    public qtde: number,
    public forcarExclusao = false
  ) {}

  stateContext: StateContext<DefinicaoEscopoStateModel>;
  definicaoEscopoService: DefinicaoEscopoService;
  deDistribuirQuantitativoService: DeDistribuirQuantitativoService;

  action(
    state: StateContext<DefinicaoEscopoStateModel>,
    context: DefinicaoEscopoState
  ): Observable<InclusaoGrupoItemQuantitativo | GenericResponse> {
    this.stateContext = state;
    this.definicaoEscopoService = context.definicaoEscopoService;
    this.deDistribuirQuantitativoService = context.deDistribuirQuantitativoService;
    this.deDistribuirQuantitativoService.emitLoading(
      this.idOrcamentoGrupoItem,
      this.idFase,
      this.pavimento.idProjetoEdificioPavimento,
      this.centroCusto.idProjetoCentroCusto,
      true
    );
    let request$: Observable<any>;
    if (isNil(this.qtde)) {
      request$ = this.deleteQuantitativo();
    } else {
      request$ = this.updateQuantitativo();
    }
    return request$.pipe(
      tap(() => {
        this.deDistribuirQuantitativoService.emitLoading(
          this.idOrcamentoGrupoItem,
          this.idFase,
          this.pavimento.idProjetoEdificioPavimento,
          this.centroCusto.idProjetoCentroCusto,
          false,
          this.qtde
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

  deleteQuantitativo(): Observable<GenericResponse> {
    const { dispatch } = this.stateContext;
    const { idOrcamentoGrupoItem, idFase, pavimento, centroCusto } = this;
    return this.definicaoEscopoService
      .deleteQuantitativo(this.centroCusto.idOrcamentoGrupoItemQuantitativo, this.forcarExclusao)
      .pipe(
        tap(() => {
          dispatch(
            new UpdateGrupoItemQuantitativo(idOrcamentoGrupoItem, idFase, pavimento, centroCusto.idProjetoCentroCusto, {
              ativo: false,
              idOrcamentoGrupoItemQuantitativo: 0,
              quantidadeReferencia: 0,
            })
          );
        }),
        catchAndThrow((response: GenericResponse) => {
          dispatch(
            new UpdateGrupoItemQuantitativo(
              idOrcamentoGrupoItem,
              idFase,
              pavimento,
              centroCusto.idProjetoCentroCusto,
              {}
            )
          );
          if (response.codigo === 2) {
            this.definicaoEscopoService.awDialogService.warning({
              title: 'Atenção',
              content: response.mensagem,
              primaryBtn: {
                title: 'Excluir',
                action: bsModalRef =>
                  this.definicaoEscopoService.store
                    .dispatch(
                      new UpdateGrupoItemQuantitativoApi(
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
    const { centroCusto, qtde, idOrcamentoGrupoItem, idFase, pavimento } = this;
    const { dispatch } = this.stateContext;
    let req$: Observable<InclusaoGrupoItemQuantitativo>;
    const payload: InclusaoGrupoItemQuantitativo = {
      dataCadastro: new Date().toISOString(),
      idFase: centroCusto.idFase,
      idOrcamentoGrupoItem: centroCusto.idOrcamentoGrupoItem,
      idOrcamentoGrupoItemQuantitativo: centroCusto.idOrcamentoGrupoItemQuantitativo,
      idProjetoCentroCusto: centroCusto.idProjetoCentroCusto,
      idProjetoEdificioPavimento: centroCusto.idProjetoEdificioPavimento,
      quantidade: qtde,
      idGrupo: this.definicaoEscopoService.grupo.idGrupo,
      idOrcamentoGrupo: this.definicaoEscopoService.grupo.idOrcamentoGrupo,
    };
    if (centroCusto.idOrcamentoGrupoItemQuantitativo) {
      req$ = this.definicaoEscopoService.updateQuantitativo(payload);
    } else {
      req$ = this.definicaoEscopoService.incluirQuantitativo(payload);
    }
    return req$.pipe(
      tap(({ idOrcamentoGrupoItemQuantitativo, dataCadastro }) => {
        dispatch(
          new UpdateGrupoItemQuantitativo(idOrcamentoGrupoItem, idFase, pavimento, centroCusto.idProjetoCentroCusto, {
            ativo: true,
            quantidadeReferencia: qtde,
            idOrcamentoGrupoItemQuantitativo,
            dataCadastro,
          })
        );
      })
    );
  }
}
