import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DuplicarGrupoItem } from '../../../definicao-escopo/model/duplicar';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { Observable, throwError } from 'rxjs';
import { GrupoItem } from '../../../definicao-escopo/model/grupo-item';
import { catchError, map, tap } from 'rxjs/operators';
import { patch } from '@ngxs/store/operators';
import { SetErrorApi } from './set-error-api';
import { GrupoItemKit } from '../../models/grupo-item';
import { UpdateGrupoItem } from './update-grupo-item';
import { SetGrupoItensApi } from './set-grupo-itens-api';
import { RefreshFilhos } from './refresh-filhos';

export class DuplicarGrupoItemApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit]  DuplicarGrupoItemApi';

  constructor(public duplicarGrupoItem: DuplicarGrupoItem) {}

  action(
    { dispatch, setState, getState }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    { definicaoEscopoLojaInsumoKitService }: DefinicaoEscopoLojaInsumoKitState
  ): Observable<GrupoItem> {
    dispatch(
      new UpdateGrupoItem(
        this.duplicarGrupoItem.idOrcamentoGrupoItem,
        patch<GrupoItemKit>({ loading: true, statusProperty: patch({ duplicar: 'loading' }) })
      )
    );
    return definicaoEscopoLojaInsumoKitService.definicaoEscopoLojaInsumoService
      .duplicarGrupoItem(this.duplicarGrupoItem)
      .pipe(
        map(resp => {
          if (!resp || resp.responseMessage.erro) {
            throw resp?.responseMessage?.erro ?? new Error('Erro ao duplicar o item');
          }
          return resp.orcamentoGrupoItem;
        }),
        tap(grupoItem => {
          dispatch([
            new UpdateGrupoItem(
              this.duplicarGrupoItem.idOrcamentoGrupoItem,
              patch<GrupoItemKit>({ loading: false, statusProperty: patch({ duplicar: null }) })
            ),
            new SetGrupoItensApi(grupoItem.idOrcamentoGrupo),
            new RefreshFilhos(this.duplicarGrupoItem.idOrcamentoGrupoItem),
          ]);
        }),
        catchError(error => {
          dispatch(
            new SetErrorApi({
              error: 'Erro ao duplicar o item',
              callAgain: definicaoEscopoLojaInsumoKitService.duplicarGrupoItemApi.bind(
                definicaoEscopoLojaInsumoKitService
              ),
              args: [this.duplicarGrupoItem],
            })
          );
          return throwError(error);
        })
      );
  }
}
