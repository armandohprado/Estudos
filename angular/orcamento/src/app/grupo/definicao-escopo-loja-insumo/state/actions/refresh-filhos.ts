import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { Observable } from 'rxjs';
import { GrupoItemDELIFilho } from '../../models/grupo-item';
import { tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { upsert } from '@aw-utils/util';

export class RefreshFilhos implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] RefreshFilhos';

  constructor(private idOrcamentoGrupoItem: number) {}

  action(
    { getState, dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): Observable<GrupoItemDELIFilho[]> {
    const grupoItem = getState().grupoItens.find(gi => gi.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    return context.definicaoEscopoLojaInsumoService
      .getGrupoItemFilhos<GrupoItemDELIFilho>(grupoItem.idOrcamentoGrupoItem, grupoItem.idGrupoItem)
      .pipe(
        tap(filhos => {
          dispatch(
            new UpdateGrupoItem(this.idOrcamentoGrupoItem, gi => {
              return {
                ...gi,
                filhos: upsert(gi.filhos, filhos, 'idOrcamentoGrupoItem', (filho1, filho2) => {
                  return {
                    ...filho1,
                    ...filho2,
                    filtros: filho1.filtros,
                    term: filho1.term,
                  };
                }),
              };
            })
          );
        })
      );
  }
}
