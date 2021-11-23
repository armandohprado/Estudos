import { ofAction, StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { Observable, throwError } from 'rxjs';
import { GrupoItemTecnico } from '../../models/grupo-item';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { ClearState } from './clear-state';
import { SetLoading } from './set-loading';

export class SetGrupoItensApi
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] SetGruposItensApi';

  constructor(public idOrcamentoGrupo: number) {}

  action(
    { patchState, dispatch, setState }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
  ): Observable<GrupoItemTecnico[]> {
    dispatch(new SetLoading(true));
    return context.definicaoEscopoGrupoTecnicoService.getGruposItens(this.idOrcamentoGrupo).pipe(
      catchError(error => {
        patchState({
          loading: false,
          errorApi: {
            error: 'Erro ao carregar os items!',
            args: [this.idOrcamentoGrupo],
            callAgain: context.definicaoEscopoGrupoTecnicoService.setGrupoItensApi.bind(context),
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
