import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { SetGrupoItemLoading } from './set-grupo-item-loading';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { SetGrupoItensApi } from './set-grupo-itens-api';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';

export class ExcluirGrupoItemApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState>
{
  static readonly type = '[DefinicaoEscopoLojaInsumo]  ExcluirGrupoItemApi';

  constructor(public idOrcamentoGrupoItem: number, public idGrupoItem: number, public forcarExclusao = false) {}

  action(
    { setState, dispatch, getState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    { definicaoEscopoLojaInsumoService }: DefinicaoEscopoLojaInsumoState
  ): Observable<void> {
    const grupo = getState().grupoItens.find(g => g.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    dispatch(new SetGrupoItemLoading(this.idOrcamentoGrupoItem, true));
    return definicaoEscopoLojaInsumoService
      .excluirGrupoItem(
        this.idOrcamentoGrupoItem,
        definicaoEscopoLojaInsumoService.idOrcamentoCenario,
        this.forcarExclusao
      )
      .pipe(
        finalize(() => {
          dispatch([
            new UpdateGrupoItem(this.idOrcamentoGrupoItem, {
              loading: false,
              errorApi: null,
              statusProperty: {},
              editingProperty: {},
              quantitativo: null,
              opened: false,
              ativo: false,
            }),
            new SetGrupoItensApi(grupo.idOrcamentoGrupo),
          ]);
        }),
        catchAndThrow((response: GenericResponse) => {
          if (response.codigo === 2) {
            definicaoEscopoLojaInsumoService.definicaoEscopoService.awDialogService.warning({
              title: 'Atenção',
              content: response.mensagem,
              primaryBtn: {
                title: 'Excluir',
                action: bsModalRef =>
                  definicaoEscopoLojaInsumoService.definicaoEscopoService.store
                    .dispatch(new ExcluirGrupoItemApi(this.idOrcamentoGrupoItem, this.idGrupoItem, true))
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
}
