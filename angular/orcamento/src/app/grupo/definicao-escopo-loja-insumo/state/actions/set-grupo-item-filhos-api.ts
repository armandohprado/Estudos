import { StateContext } from '@ngxs/store';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoLojaInsumoState } from '../definicao-escopo-loja-insumo.state';
import { DefinicaoEscopoLojaInsumoStateModel } from '../definicao-escopo-loja-insumo.model';
import { Observable } from 'rxjs';
import { GrupoItemDELIFilho } from '../../models/grupo-item';
import { tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { SetGrupoItemLoading } from './set-grupo-item-loading';

export class SetGrupoItemFilhosApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoStateModel, DefinicaoEscopoLojaInsumoState> {
  static readonly type = '[DefinicaoEscopoLojaInsumo] SetGrupoItemFilhosApi';

  constructor(private idOrcamentoGrupoItem: number, private idGrupoItem: number) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoStateModel>,
    context: DefinicaoEscopoLojaInsumoState
  ): Observable<GrupoItemDELIFilho[]> {
    dispatch(new SetGrupoItemLoading(this.idOrcamentoGrupoItem, true));
    return context.definicaoEscopoLojaInsumoService
      .getGrupoItemFilhos<GrupoItemDELIFilho>(this.idOrcamentoGrupoItem, this.idGrupoItem)
      .pipe(
        tap(filhos => {
          dispatch(
            new UpdateGrupoItem(this.idOrcamentoGrupoItem, {
              filhos,
              loading: false,
              opened: true,
            })
          );
        })
      );
  }
}
