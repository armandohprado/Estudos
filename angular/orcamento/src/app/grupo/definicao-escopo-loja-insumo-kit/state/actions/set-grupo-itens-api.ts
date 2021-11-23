import { ofAction, StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { Observable, throwError } from 'rxjs';
import { GrupoItemKit } from '../../models/grupo-item';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { ClearState } from './clear-state';
import { SetLoading } from './set-loading';

export class SetGrupoItensApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] SetGruposItensApi';

  constructor(public idOrcamentoGrupo: number) {}

  action(
    { patchState, dispatch, setState }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
  ): Observable<GrupoItemKit[]> {
    dispatch(new SetLoading(true));
    return context.definicaoEscopoLojaInsumoKitService.getGruposItens(this.idOrcamentoGrupo).pipe(
      catchError(error => {
        patchState({
          loading: false,
          errorApi: {
            error: 'Erro ao carregar os items!',
            args: [this.idOrcamentoGrupo],
            callAgain: context.definicaoEscopoLojaInsumoKitService.setGrupoItensApi.bind(context),
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
              return grupoItem;
            }),
          };
        });
      }),
      takeUntil(context.actions$.pipe(ofAction(ClearState)))
    );
  }
}
