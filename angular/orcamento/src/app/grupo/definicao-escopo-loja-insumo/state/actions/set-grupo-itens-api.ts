import { ofAction, StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { Observable, throwError } from 'rxjs';
import { GrupoItemDELI, GrupoItemDELITab } from '../../models/grupo-item';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { ClearState } from './clear-state';
import { SetLoading } from './set-loading';

export class SetGrupoItensApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] SetGruposItensApi';

  constructor(public idOrcamentoGrupo: number) {}

  action(
    { patchState, dispatch, setState }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): Observable<GrupoItemDELI[]> {
    dispatch(new SetLoading(true));
    return context.definicaoEscopoLojaInsumoService.getGruposItens<GrupoItemDELI>(this.idOrcamentoGrupo).pipe(
      catchError(error => {
        patchState({
          loading: false,
          errorApi: {
            error: 'Erro ao carregar os items!',
            args: [this.idOrcamentoGrupo],
            callAgain: context.definicaoEscopoLojaInsumoService.setGrupoItensApi.bind(context),
          },
        });
        return throwError(error);
      }),
      tap(grupoItens => {
        setState(state => {
          return {
            ...state,
            loading: false,
            errorApi: null,
            grupoItens: grupoItens.map(grupoItem => {
              if (grupoItem.ativo) {
                const currentGrupoItem = state.grupoItens?.find(
                  ({ idOrcamentoGrupoItem }) => idOrcamentoGrupoItem === grupoItem.idOrcamentoGrupoItem
                );
                if (currentGrupoItem) {
                  grupoItem = {
                    ...currentGrupoItem,
                    ...grupoItem,
                  };
                }
              }
              return { ...grupoItem, activeTab: grupoItem.activeTab ?? GrupoItemDELITab.quantificar };
            }),
          };
        });
      }),
      takeUntil(context.actions$.pipe(ofAction(ClearState)))
    );
  }
}
