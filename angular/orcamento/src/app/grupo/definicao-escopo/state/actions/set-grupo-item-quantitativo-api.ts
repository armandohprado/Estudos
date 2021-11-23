import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { StateContext } from '@ngxs/store';
import { Observable, throwError } from 'rxjs';
import { UpdateGrupoItem } from './update-grupo-item';
import { catchError, tap } from 'rxjs/operators';
import { Quantitativo } from '../../shared/de-distribuir-quantitativo/model/quantitativo';

export class SetGrupoItemQuantitativoApi implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] SetGrupoItemQuantitativoApi';

  constructor(private idOrcamentoGrupoItem: number, private refresh = false) {}

  action(
    { dispatch, getState }: StateContext<DefinicaoEscopoStateModel>,
    context: DefinicaoEscopoState
  ): Observable<Quantitativo> | void {
    const { idOrcamentoGrupoItem, refresh } = this;
    if (idOrcamentoGrupoItem === 0) {
      return;
    }
    const grupoItem = getState().gruposItens.find(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem);
    if (grupoItem.quantitativo && !refresh) {
      return;
    }
    if (!refresh) {
      dispatch(new UpdateGrupoItem(idOrcamentoGrupoItem, { loading: true }));
    }
    return context.definicaoEscopoService
      .getQuantitativo(context.definicaoEscopoService.grupo.idOrcamento, idOrcamentoGrupoItem)
      .pipe(
        tap(quantitativo => {
          dispatch(
            new UpdateGrupoItem(idOrcamentoGrupoItem, {
              loading: false,
              quantitativo,
              errorApi: null,
            })
          );
        }),
        catchError(error => {
          dispatch(
            new UpdateGrupoItem(idOrcamentoGrupoItem, {
              errorApi: {
                error: 'Erro ao tentar carregar o quantitativo',
                args: [idOrcamentoGrupoItem],
                callAgain: context.definicaoEscopoService.setGrupoItemQuantitativoApi.bind(
                  context.definicaoEscopoService
                ),
              },
              loading: false,
            })
          );
          return throwError(error);
        })
      );
  }
}
