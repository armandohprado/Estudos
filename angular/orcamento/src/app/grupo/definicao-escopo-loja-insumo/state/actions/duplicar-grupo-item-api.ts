import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { DuplicarGrupoItem } from '../../../definicao-escopo/model/duplicar';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { Observable, throwError } from 'rxjs';
import { GrupoItem } from '../../../definicao-escopo/model/grupo-item';
import { catchError, map, tap } from 'rxjs/operators';
import { patch } from '@ngxs/store/operators';
import { SetErrorApi } from './set-error-api';
import { GrupoItemDELI } from '../../models/grupo-item';
import { UpdateGrupoItem } from './update-grupo-item';
import { SetGrupoItensApi } from './set-grupo-itens-api';

export class DuplicarGrupoItemApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo]  DuplicarGrupoItemApi';

  constructor(public duplicarGrupoItem: DuplicarGrupoItem) {}

  action(
    { dispatch, setState, getState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    { definicaoEscopoLojaInsumoService }: DefinicaoEscopoLojaInsumoState
  ): Observable<GrupoItem> {
    dispatch(
      new UpdateGrupoItem(
        this.duplicarGrupoItem.idOrcamentoGrupoItem,
        patch<GrupoItemDELI>({
          loading: true,
          statusProperty: patch({ duplicar: 'loading' }),
        })
      )
    );
    return definicaoEscopoLojaInsumoService.duplicarGrupoItem(this.duplicarGrupoItem).pipe(
      map(resp => {
        if (!resp || resp.responseMessage.erro) {
          throw resp?.responseMessage.erro ?? new Error('Erro ao duplicar o item');
        }
        return resp.orcamentoGrupoItem;
      }),
      tap(grupoItem => {
        dispatch([
          new UpdateGrupoItem(
            this.duplicarGrupoItem.idOrcamentoGrupoItem,
            patch<GrupoItemDELI>({
              loading: false,
              statusProperty: patch({ duplicar: null }),
            })
          ),
          new SetGrupoItensApi(grupoItem.idOrcamentoGrupo),
        ]);
      }),
      catchError(error => {
        dispatch(
          new SetErrorApi({
            error: 'Erro ao duplicar o item',
            callAgain: definicaoEscopoLojaInsumoService.duplicarGrupoItemApi.bind(definicaoEscopoLojaInsumoService),
            args: [this.duplicarGrupoItem],
          })
        );
        return throwError(error);
      })
    );
  }
}
