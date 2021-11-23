import { StateContext } from '@ngxs/store';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoLojaInsumoKitState } from '../definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoLojaInsumoKitStateModel } from '../definicao-escopo-loja-insumo-kit.model';
import { Observable } from 'rxjs';
import { GrupoItemKitFilho } from '../../models/grupo-item';
import { tap } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { SetGrupoItemLoading } from './set-grupo-item-loading';

export class SetGrupoItemFilhosApi
  implements NgxsAction<DefinicaoEscopoLojaInsumoKitStateModel, DefinicaoEscopoLojaInsumoKitState> {
  static readonly type = '[DefinicaoEscopoLojaInsumoKit] SetGrupoItemFilhosApi';

  constructor(private idOrcamentoGrupoItem: number, private idGrupoItem: number) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>,
    context: DefinicaoEscopoLojaInsumoKitState
  ): Observable<GrupoItemKitFilho[]> {
    dispatch(new SetGrupoItemLoading(this.idGrupoItem, true, 'idGrupoItem'));
    return context.definicaoEscopoLojaInsumoKitService
      .getGrupoItemFilhos(this.idOrcamentoGrupoItem, this.idGrupoItem)
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
