import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { StateContext } from '@ngxs/store';
import { Observable, throwError } from 'rxjs';
import { GrupoItemAtributo } from '../../model/grupo-item-atributo';
import { UpdateGrupoItem } from './update-grupo-item';
import { catchError, tap } from 'rxjs/operators';

export class SetGrupoItemAtributosApi implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] SetGrupoItemAtributosApi';
  constructor(public idOrcamentoGrupoItem: number, private scroll?: boolean) {}
  action(
    { dispatch }: StateContext<DefinicaoEscopoStateModel>,
    context: DefinicaoEscopoState
  ): Observable<GrupoItemAtributo[]> | void {
    const { idOrcamentoGrupoItem } = this;
    dispatch(new UpdateGrupoItem(idOrcamentoGrupoItem, { loading: true }));
    return context.definicaoEscopoService.getAtributos(idOrcamentoGrupoItem).pipe(
      tap(atributos => {
        dispatch(
          new UpdateGrupoItem(idOrcamentoGrupoItem, {
            errorApi: null,
            atributos,
            opened: true,
            loading: false,
            activeMode: 'atributos',
            activeTab: atributos && atributos.length ? 'atributo1' : 'complemento',
          })
        );
        if (this.scroll) {
          context.definicaoEscopoService.scrollIntoView(idOrcamentoGrupoItem);
        }
      }),
      catchError(error => {
        dispatch(
          new UpdateGrupoItem(idOrcamentoGrupoItem, {
            errorApi: {
              error: 'Erro ao tentar carregar os atributos!',
              args: [idOrcamentoGrupoItem],
              callAgain: context.definicaoEscopoService.setGrupoItemAtributosApi.bind(context.definicaoEscopoService),
            },
            opened: true,
            loading: false,
            activeMode: 'atributos',
            activeTab: 'complemento',
          })
        );
        return throwError(error);
      })
    );
  }
}
