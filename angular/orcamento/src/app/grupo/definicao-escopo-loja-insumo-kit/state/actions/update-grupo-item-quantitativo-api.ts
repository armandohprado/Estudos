import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { Pavimento } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/pavimento';
import { CentroCusto } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/centro-custo';
import { DefinicaoEscopoService } from '../../../definicao-escopo/definicao-escopo.service';
import { DeDistribuirQuantitativoService } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/de-distribuir-quantitativo.service';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { DefinicaoEscopoLojaInsumoKitService } from '../../definicao-escopo-loja-insumo-kit.service';
import { Observable } from 'rxjs';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';
import { finalize, tap } from 'rxjs/operators';
import { InclusaoGrupoItemQuantitativo } from '../../../definicao-escopo/model/atualizacao-quantitativo';
import { isNil } from 'lodash-es';
import { RefreshFilhos } from './refresh-filhos';
import { UpdateGrupoItemQuantitativo } from './update-grupo-item-quantitativo';
import { UpdateGrupoItem } from './update-grupo-item';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { RefreshQuantitativo } from './refresh-quantitativo';

export class UpdateGrupoItemQuantitativoApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState>
{
  static readonly type = '[DefinicaoEscopoLojaInsumoKit]  UpdateGrupoItemQuantitativoApi';

  constructor(
    public idOrcamentoGrupoItem: number,
    public idFase: number,
    public pavimento: Pavimento,
    public centroCusto: CentroCusto,
    public qtde: number,
    public forcarExclusao = false
  ) {}

  stateContext: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>;
  definicaoEscopoService: DefinicaoEscopoService;
  definicaoEscopoLojaInsumoKitService: DefinicaoEscopoLojaInsumoKitService;
  deDistribuirQuantitativoService: DeDistribuirQuantitativoService;

  action(
    ctx: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    { definicaoEscopoLojaInsumoKitService, deDistribuirQuantitativoService }: DefinicaoEscopoLojaInsumoKitState
  ): Observable<InclusaoGrupoItemQuantitativo | GenericResponse> {
    this.stateContext = ctx;
    this.deDistribuirQuantitativoService = deDistribuirQuantitativoService;
    this.definicaoEscopoService = definicaoEscopoLojaInsumoKitService.definicaoEscopoService;
    this.definicaoEscopoLojaInsumoKitService = definicaoEscopoLojaInsumoKitService;
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
    return request$.pipe(
      tap(() => {
        ctx.dispatch(new RefreshFilhos(this.idOrcamentoGrupoItem));
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
      }),
      finalize(() => {
        this.setQuantitativoLoading(false);
      })
    );
  }

  setQuantitativoLoading(loading: boolean): void {
    this.stateContext.dispatch(
      new UpdateGrupoItem(this.idOrcamentoGrupoItem, grupoItem => ({
        ...grupoItem,
        quantitativo: { ...grupoItem.quantitativo, loading },
      }))
    );
  }

  deleteQuantitativo(): Observable<GenericResponse> {
    return this.definicaoEscopoService
      .deleteQuantitativo(this.centroCusto.idOrcamentoGrupoItemQuantitativo, this.forcarExclusao, true)
      .pipe(
        tap(() => {
          this.stateContext.dispatch(
            new UpdateGrupoItemQuantitativo(
              this.idOrcamentoGrupoItem,
              this.idFase,
              this.pavimento,
              this.centroCusto.idProjetoCentroCusto,
              {
                ativo: false,
                idOrcamentoGrupoItemQuantitativo: 0,
                quantidadeReferencia: 0,
              }
            )
          );
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
    const { centroCusto, qtde } = this;
    const payload: InclusaoGrupoItemQuantitativo = {
      dataCadastro: new Date().toISOString(),
      idFase: centroCusto.idFase,
      idOrcamentoGrupoItem: centroCusto.idOrcamentoGrupoItem,
      idOrcamentoGrupoItemQuantitativo: centroCusto.idOrcamentoGrupoItemQuantitativo,
      idProjetoCentroCusto: centroCusto.idProjetoCentroCusto,
      idProjetoEdificioPavimento: centroCusto.idProjetoEdificioPavimento,
      quantidade: qtde,
      idGrupo: this.definicaoEscopoLojaInsumoKitService.grupo.idGrupo,
      idOrcamentoGrupo: this.definicaoEscopoLojaInsumoKitService.grupo.idOrcamentoGrupo,
    };
    return (
      centroCusto.idOrcamentoGrupoItemQuantitativo
        ? this.definicaoEscopoService.updateQuantitativo(payload, true)
        : this.definicaoEscopoService.incluirQuantitativo(payload, true)
    ).pipe(
      tap(
        ({
          idOrcamentoGrupoItemQuantitativo,
          dataCadastro,
          idOrcamentoGrupoItemAtualizados,
          atualizarRelacionados,
        }) => {
          const actions: NgxsAction[] = [
            new UpdateGrupoItemQuantitativo(
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
            ),
          ];
          if (atualizarRelacionados) {
            actions.push(new RefreshQuantitativo(idOrcamentoGrupoItemAtualizados ?? []));
          }
          this.stateContext.dispatch(actions);
        }
      )
    );
  }
}
